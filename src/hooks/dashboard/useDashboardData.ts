
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/profile/useProfileHooks';

interface DashboardStats {
  todayAppointments: number;
  totalClients: number;
  monthlyRevenue: number;
  todayRevenue: number;
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

      try {
        // Get today's appointments with staff names - use explicit foreign key syntax to avoid ambiguity
        const { data: todayAppts, count: todayCount, error: todayError } = await supabase
          .from('appointments')
          .select(`
            *,
            staff!appointments_staff_id_fkey(name)
          `, { count: 'exact' })
          .eq('salon_id', user.id)
          .eq('date', today)
          .order('start_time');

        if (todayError) {
          console.error('Error fetching today appointments:', todayError);
          throw todayError;
        }

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
        const { count: yesterdayCount, error: yesterdayError } = await supabase
          .from('appointments')
          .select('*', { count: 'exact' })
          .eq('salon_id', user.id)
          .eq('date', yesterday);

        if (yesterdayError) {
          console.error('Error fetching yesterday appointments:', yesterdayError);
        }

        // Get total clients
        const { count: totalClientsCount, error: clientsError } = await supabase
          .from('clients')
          .select('*', { count: 'exact' })
          .eq('salon_id', user.id);

        if (clientsError) {
          console.error('Error fetching clients:', clientsError);
        }

        // Get clients from last month for growth calculation
        const { count: lastMonthClientsCount, error: lastMonthClientsError } = await supabase
          .from('clients')
          .select('*', { count: 'exact' })
          .eq('salon_id', user.id)
          .lt('created_at', new Date().toISOString().slice(0, 8) + '01');

        if (lastMonthClientsError) {
          console.error('Error fetching last month clients:', lastMonthClientsError);
        }

        // Get current month revenue from completed appointments
        const { data: currentMonthAppts, error: currentMonthError } = await supabase
          .from('appointments')
          .select('price')
          .eq('salon_id', user.id)
          .gte('date', currentMonth + '-01')
          .eq('status', 'Completed');

        if (currentMonthError) {
          console.error('Error fetching current month revenue:', currentMonthError);
        }

        // Get today's revenue from completed appointments
        const { data: todayAppts2, error: todayRevenueError } = await supabase
          .from('appointments')
          .select('price')
          .eq('salon_id', user.id)
          .eq('date', today)
          .eq('status', 'Completed');

        if (todayRevenueError) {
          console.error('Error fetching today revenue:', todayRevenueError);
        }

        // Get last month revenue for growth calculation
        const { data: lastMonthAppts, error: lastMonthError } = await supabase
          .from('appointments')
          .select('price')
          .eq('salon_id', user.id)
          .gte('date', lastMonth + '-01')
          .lt('date', currentMonth + '-01')
          .eq('status', 'Completed');

        if (lastMonthError) {
          console.error('Error fetching last month revenue:', lastMonthError);
        }

        // Get status-specific counts for today
        const { count: checkInsCount, error: checkInsError } = await supabase
          .from('appointments')
          .select('*', { count: 'exact' })
          .eq('salon_id', user.id)
          .eq('date', today)
          .in('status', ['Confirmed', 'In Progress', 'Completed']);

        if (checkInsError) {
          console.error('Error fetching check-ins:', checkInsError);
        }

        const { count: noShowsCount, error: noShowsError } = await supabase
          .from('appointments')
          .select('*', { count: 'exact' })
          .eq('salon_id', user.id)
          .eq('date', today)
          .eq('status', 'No Show');

        if (noShowsError) {
          console.error('Error fetching no-shows:', noShowsError);
        }

        // Calculate growth percentages
        const currentMonthRevenue = currentMonthAppts?.reduce((sum, apt) => sum + (Number(apt.price) || 0), 0) || 0;
        const todayRevenue = todayAppts2?.reduce((sum, apt) => sum + (Number(apt.price) || 0), 0) || 0;
        const lastMonthRevenue = lastMonthAppts?.reduce((sum, apt) => sum + (Number(apt.price) || 0), 0) || 0;

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
          todayRevenue,
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
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes for real-time updates
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};
