
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

      // Get today's appointments
      const { data: todayAppts, count: todayCount } = await supabase
        .from('appointments')
        .select('*', { count: 'exact' })
        .eq('salon_id', user.id)
        .eq('date', today);

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

      const currentMonthRevenue = currentMonthAppts?.reduce((sum, apt) => sum + (Number(apt.price) || 0), 0) || 0;
      const lastMonthRevenue = lastMonthAppts?.reduce((sum, apt) => sum + (Number(apt.price) || 0), 0) || 0;

      // Calculate growth percentages
      const appointmentGrowth = yesterdayCount ? ((todayCount || 0) - yesterdayCount) / yesterdayCount * 100 : 0;
      const clientGrowth = lastMonthClientsCount ? ((totalClientsCount || 0) - lastMonthClientsCount) / lastMonthClientsCount * 100 : 0;
      const revenueGrowth = lastMonthRevenue ? (currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100 : 0;

      return {
        todayAppointments: todayCount || 0,
        totalClients: totalClientsCount || 0,
        monthlyRevenue: currentMonthRevenue,
        appointmentGrowth,
        clientGrowth,
        revenueGrowth
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
  });
};
