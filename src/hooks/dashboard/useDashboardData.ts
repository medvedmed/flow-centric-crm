
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/profile/useProfileHooks';

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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const today = new Date();
      const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
      const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59).toISOString();
      
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const startOfYesterday = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate()).toISOString();
      const endOfYesterday = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 23, 59, 59).toISOString();
      
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();
      const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1).toISOString();
      const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59).toISOString();

      try {
        // Get today's appointments with related data
        const { data: todayAppts, count: todayCount, error: todayError } = await supabase
          .from('appointments')
          .select(`
            *,
            clients!appointments_client_id_fkey(full_name, phone),
            services!appointments_service_id_fkey(name, price),
            profiles!appointments_staff_id_fkey(full_name)
          `, { count: 'exact' })
          .eq('organization_id', user.id)
          .gte('start_time', startOfToday)
          .lte('start_time', endOfToday)
          .order('start_time');

        if (todayError) {
          console.error('Error fetching today appointments:', todayError);
          throw todayError;
        }

        // Get upcoming appointments for next 4 slots
        const currentTime = new Date().toISOString();
        const upcomingAppointments = (todayAppts || [])
          .filter(apt => apt.start_time >= currentTime)
          .slice(0, 4)
          .map(apt => ({
            id: apt.id,
            time: apt.start_time?.split('T')[1]?.slice(0, 5) || '',
            client: apt.clients?.full_name || 'Unknown',
            staff: apt.profiles?.full_name || 'Unknown',
            service: apt.services?.name || 'Service',
            phone: apt.clients?.phone
          }));

        // Get yesterday's appointments for growth calculation
        const { count: yesterdayCount, error: yesterdayError } = await supabase
          .from('appointments')
          .select('*', { count: 'exact' })
          .eq('organization_id', user.id)
          .gte('start_time', startOfYesterday)
          .lte('start_time', endOfYesterday);

        if (yesterdayError) {
          console.error('Error fetching yesterday appointments:', yesterdayError);
        }

        // Get total clients
        const { count: totalClientsCount, error: clientsError } = await supabase
          .from('clients')
          .select('*', { count: 'exact' })
          .eq('organization_id', user.id);

        if (clientsError) {
          console.error('Error fetching clients:', clientsError);
        }

        // Get clients from last month for growth calculation
        const { count: lastMonthClientsCount, error: lastMonthClientsError } = await supabase
          .from('clients')
          .select('*', { count: 'exact' })
          .eq('organization_id', user.id)
          .lt('created_at', startOfMonth);

        if (lastMonthClientsError) {
          console.error('Error fetching last month clients:', lastMonthClientsError);
        }

        // Get current month revenue from completed appointments
        const { data: currentMonthAppts, error: currentMonthError } = await supabase
          .from('appointments')
          .select(`
            services!appointments_service_id_fkey(price)
          `)
          .eq('organization_id', user.id)
          .gte('start_time', startOfMonth)
          .eq('status', 'Completed');

        if (currentMonthError) {
          console.error('Error fetching current month revenue:', currentMonthError);
        }

        // Get last month revenue for growth calculation
        const { data: lastMonthAppts, error: lastMonthError } = await supabase
          .from('appointments')
          .select(`
            services!appointments_service_id_fkey(price)
          `)
          .eq('organization_id', user.id)
          .gte('start_time', startOfLastMonth)
          .lt('start_time', startOfMonth)
          .eq('status', 'Completed');

        if (lastMonthError) {
          console.error('Error fetching last month revenue:', lastMonthError);
        }

        // Get status-specific counts for today
        const { count: checkInsCount, error: checkInsError } = await supabase
          .from('appointments')
          .select('*', { count: 'exact' })
          .eq('organization_id', user.id)
          .gte('start_time', startOfToday)
          .lte('start_time', endOfToday)
          .in('status', ['Confirmed', 'In Progress', 'Completed']);

        if (checkInsError) {
          console.error('Error fetching check-ins:', checkInsError);
        }

        const { count: noShowsCount, error: noShowsError } = await supabase
          .from('appointments')
          .select('*', { count: 'exact' })
          .eq('organization_id', user.id)
          .gte('start_time', startOfToday)
          .lte('start_time', endOfToday)
          .eq('status', 'No Show');

        if (noShowsError) {
          console.error('Error fetching no-shows:', noShowsError);
        }

        // Calculate growth percentages
        const currentMonthRevenue = (currentMonthAppts || []).reduce((sum, apt) => sum + (Number(apt.services?.price) || 0), 0);
        const lastMonthRevenue = (lastMonthAppts || []).reduce((sum, apt) => sum + (Number(apt.services?.price) || 0), 0);

        const appointmentGrowth = yesterdayCount ? ((todayCount || 0) - yesterdayCount) / yesterdayCount * 100 : 0;
        const clientGrowth = lastMonthClientsCount ? ((totalClientsCount || 0) - lastMonthClientsCount) / lastMonthClientsCount * 100 : 0;
        const revenueGrowth = lastMonthRevenue ? (currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100 : 0;

        // Real waiting list based on appointments with status 'waiting' or similar
        const waitingList = (todayAppts || [])
          .filter(apt => apt.status === 'waiting' || apt.status === 'checked-in')
          .map(apt => ({
            name: apt.clients?.full_name || 'Unknown',
            service: apt.services?.name || 'Service',
            waitTime: 'Waiting'
          }));

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
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};
