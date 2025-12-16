
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/profile/useProfileHooks';
import { getUserOrgId } from '@/services/api/helpers';

interface DashboardStats {
  todayAppointments: number;
  totalClients: number;
  monthlyRevenue: number;
  appointmentGrowth: number;
  clientGrowth: number;
  revenueGrowth: number;
  waitingClients: number;
  checkIns: number;
  noShows: number;
  upcomingAppointments: Array<{
    id: string;
    time: string;
    client: string;
    staff: string;
    service: string;
    phone?: string;
  }>;
  waitingList: Array<{
    name: string;
    service: string;
    waitTime: string;
  }>;
}

export const useDashboardStats = () => {
  const { data: profile } = useProfile();

  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async (): Promise<DashboardStats> => {
      const orgId = await getUserOrgId();

      const today = new Date();
      const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
      const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59).toISOString();
      
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const startOfYesterday = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate()).toISOString();
      const endOfYesterday = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 23, 59, 59).toISOString();
      
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();
      const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1).toISOString();

      try {
        // Get today's appointments
        const { data: todayAppts, count: todayCount, error: todayError } = await supabase
          .from('appointments')
          .select('*', { count: 'exact' })
          .eq('organization_id', orgId)
          .gte('start_time', startOfToday)
          .lte('start_time', endOfToday)
          .order('start_time');

        if (todayError) throw todayError;

        // Get related data
        const clientIds = [...new Set((todayAppts || []).map(a => a.client_id).filter(Boolean))];
        const serviceIds = [...new Set((todayAppts || []).map(a => a.service_id).filter(Boolean))];
        const staffIds = [...new Set((todayAppts || []).map(a => a.staff_id).filter(Boolean))];

        const [clientsRes, servicesRes, staffRes] = await Promise.all([
          clientIds.length > 0 ? supabase.from('clients').select('id, full_name, phone').in('id', clientIds) : { data: [] },
          serviceIds.length > 0 ? supabase.from('services').select('id, name, price').in('id', serviceIds) : { data: [] },
          staffIds.length > 0 ? supabase.from('staff').select('id, name').in('id', staffIds) : { data: [] }
        ]);

        const clientsMap = new Map((clientsRes.data || []).map(c => [c.id, c]));
        const servicesMap = new Map((servicesRes.data || []).map(s => [s.id, s]));
        const staffMap = new Map((staffRes.data || []).map(s => [s.id, s]));

        // Get upcoming appointments
        const currentTime = new Date().toISOString();
        const upcomingAppointments = (todayAppts || [])
          .filter(apt => apt.start_time >= currentTime)
          .slice(0, 4)
          .map(apt => {
            const client = apt.client_id ? clientsMap.get(apt.client_id) : null;
            const service = apt.service_id ? servicesMap.get(apt.service_id) : null;
            const staffMember = apt.staff_id ? staffMap.get(apt.staff_id) : null;
            return {
              id: apt.id,
              time: apt.start_time?.split('T')[1]?.slice(0, 5) || '',
              client: client?.full_name || 'Unknown',
              staff: staffMember?.name || 'Unknown',
              service: service?.name || 'Service',
              phone: client?.phone
            };
          });

        // Get yesterday's appointments for growth calculation
        const { count: yesterdayCount } = await supabase
          .from('appointments')
          .select('*', { count: 'exact' })
          .eq('organization_id', orgId)
          .gte('start_time', startOfYesterday)
          .lte('start_time', endOfYesterday);

        // Get total clients
        const { count: totalClientsCount } = await supabase
          .from('clients')
          .select('*', { count: 'exact' })
          .eq('organization_id', orgId);

        // Get clients from last month
        const { count: lastMonthClientsCount } = await supabase
          .from('clients')
          .select('*', { count: 'exact' })
          .eq('organization_id', orgId)
          .lt('created_at', startOfMonth);

        // Get current month completed appointments for revenue
        const { data: currentMonthAppts } = await supabase
          .from('appointments')
          .select('service_id')
          .eq('organization_id', orgId)
          .gte('start_time', startOfMonth)
          .eq('status', 'Completed');

        const currentServiceIds = [...new Set((currentMonthAppts || []).map(a => a.service_id).filter(Boolean))];
        const { data: currentServices } = currentServiceIds.length > 0 
          ? await supabase.from('services').select('id, price').in('id', currentServiceIds)
          : { data: [] };
        const currentServicesMap = new Map((currentServices || []).map(s => [s.id, s.price]));
        const currentMonthRevenue = (currentMonthAppts || []).reduce((sum, apt) => 
          sum + (currentServicesMap.get(apt.service_id) || 0), 0);

        // Get last month completed appointments for revenue
        const { data: lastMonthAppts } = await supabase
          .from('appointments')
          .select('service_id')
          .eq('organization_id', orgId)
          .gte('start_time', startOfLastMonth)
          .lt('start_time', startOfMonth)
          .eq('status', 'Completed');

        const lastServiceIds = [...new Set((lastMonthAppts || []).map(a => a.service_id).filter(Boolean))];
        const { data: lastServices } = lastServiceIds.length > 0 
          ? await supabase.from('services').select('id, price').in('id', lastServiceIds)
          : { data: [] };
        const lastServicesMap = new Map((lastServices || []).map(s => [s.id, s.price]));
        const lastMonthRevenue = (lastMonthAppts || []).reduce((sum, apt) => 
          sum + (lastServicesMap.get(apt.service_id) || 0), 0);

        // Get status counts
        const { count: checkInsCount } = await supabase
          .from('appointments')
          .select('*', { count: 'exact' })
          .eq('organization_id', orgId)
          .gte('start_time', startOfToday)
          .lte('start_time', endOfToday)
          .in('status', ['Confirmed', 'In Progress', 'Completed']);

        const { count: noShowsCount } = await supabase
          .from('appointments')
          .select('*', { count: 'exact' })
          .eq('organization_id', orgId)
          .gte('start_time', startOfToday)
          .lte('start_time', endOfToday)
          .eq('status', 'No Show');

        // Calculate growth
        const appointmentGrowth = yesterdayCount ? ((todayCount || 0) - yesterdayCount) / yesterdayCount * 100 : 0;
        const clientGrowth = lastMonthClientsCount ? ((totalClientsCount || 0) - lastMonthClientsCount) / lastMonthClientsCount * 100 : 0;
        const revenueGrowth = lastMonthRevenue ? (currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100 : 0;

        // Waiting list
        const waitingList = (todayAppts || [])
          .filter(apt => apt.status === 'waiting' || apt.status === 'checked-in')
          .map(apt => {
            const client = apt.client_id ? clientsMap.get(apt.client_id) : null;
            const service = apt.service_id ? servicesMap.get(apt.service_id) : null;
            return {
              name: client?.full_name || 'Unknown',
              service: service?.name || 'Service',
              waitTime: 'Waiting'
            };
          });

        return {
          todayAppointments: todayCount || 0,
          totalClients: totalClientsCount || 0,
          monthlyRevenue: currentMonthRevenue,
          appointmentGrowth,
          clientGrowth,
          revenueGrowth,
          waitingClients: waitingList.length,
          checkIns: checkInsCount || 0,
          noShows: noShowsCount || 0,
          upcomingAppointments,
          waitingList
        };
      } catch (error) {
        console.error('Dashboard stats error:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 2 * 60 * 1000,
    retry: 3,
  });
};
