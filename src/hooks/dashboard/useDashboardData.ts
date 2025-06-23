
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

      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const currentMonth = new Date().toISOString().slice(0, 7);
      const lastMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 7);

      // Get today's appointments with staff names
      const { data: todayAppts, count: todayCount } = await supabase
        .from('appointments')
        .select(`
          *,
          staff!inner(name)
        `, { count: 'exact' })
        .eq('salon_id', user.id)
        .eq('date', today)
        .order('start_time');

      // Get upcoming appointments for next 4 slots
      const currentTime = new Date().toTimeString().slice(0, 5);
      const upcomingAppointments = (todayAppts || [])
        .filter(apt => apt.start_time >= currentTime)
        .slice(0, 4)
        .map(apt => ({
          id: apt.id,
          time: apt.start_time,
          client: apt.client_name,
          staff: apt.staff?.name || 'Unknown',
          service: apt.service,
          phone: apt.client_phone
        }));

      // Get yesterday's appointments for growth calculation
      const { count: yesterdayCount } = await supabase
        .from('appointments')
        .select('*', { count: 'exact' })
        .eq('salon_id', user.id)
        .eq('date', yesterday);

      // Get total clients
      const { count: totalClientsCount } = await supabase
        .from('clients')
        .select('*', { count: 'exact' })
        .eq('salon_id', user.id);

      // Get clients from last month for growth calculation
      const { count: lastMonthClientsCount } = await supabase
        .from('clients')
        .select('*', { count: 'exact' })
        .eq('salon_id', user.id)
        .lt('created_at', new Date().toISOString().slice(0, 8) + '01');

      // Get current month revenue from completed appointments
      const { data: currentMonthAppts } = await supabase
        .from('appointments')
        .select('price')
        .eq('salon_id', user.id)
        .gte('date', currentMonth + '-01')
        .eq('status', 'Completed');

      // Get last month revenue for growth calculation
      const { data: lastMonthAppts } = await supabase
        .from('appointments')
        .select('price')
        .eq('salon_id', user.id)
        .gte('date', lastMonth + '-01')
        .lt('date', currentMonth + '-01')
        .eq('status', 'Completed');

      // Get status-specific counts for today
      const { count: checkInsCount } = await supabase
        .from('appointments')
        .select('*', { count: 'exact' })
        .eq('salon_id', user.id)
        .eq('date', today)
        .in('status', ['Confirmed', 'In Progress', 'Completed']);

      const { count: noShowsCount } = await supabase
        .from('appointments')
        .select('*', { count: 'exact' })
        .eq('salon_id', user.id)
        .eq('date', today)
        .eq('status', 'No Show');

      const currentMonthRevenue = currentMonthAppts?.reduce((sum, apt) => sum + (Number(apt.price) || 0), 0) || 0;
      const lastMonthRevenue = lastMonthAppts?.reduce((sum, apt) => sum + (Number(apt.price) || 0), 0) || 0;

      // Calculate growth percentages
      const appointmentGrowth = yesterdayCount ? ((todayCount || 0) - yesterdayCount) / yesterdayCount * 100 : 0;
      const clientGrowth = lastMonthClientsCount ? ((totalClientsCount || 0) - lastMonthClientsCount) / lastMonthClientsCount * 100 : 0;
      const revenueGrowth = lastMonthRevenue ? (currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100 : 0;

      // Mock waiting list for now (you can replace with real data later)
      const waitingList = [
        { name: 'Lisa Brown', service: 'Walk-in Cut', waitTime: '15 min' },
        { name: 'James Wilson', service: 'Quick Trim', waitTime: '8 min' },
      ];

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
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes for real-time updates
  });
};
