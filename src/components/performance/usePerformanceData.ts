
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { StaffPerformance, ClientCategorization } from './types';

export const usePerformanceData = () => {
  const { user } = useAuth();

  const performanceQuery = useQuery({
    queryKey: ['staff-performance'],
    queryFn: async () => {
      const currentMonth = new Date().toISOString().slice(0, 7) + '-01';
      
      const { data, error } = await supabase
        .from('staff_performance')
        .select(`*`)
        .eq('salon_id', user?.id)
        .eq('month', currentMonth)
        .order('total_revenue', { ascending: false });
      
      if (error) throw error;

      // Get staff names separately
      const staffIds = data.map(item => item.staff_id);
      const { data: staffData, error: staffError } = await supabase
        .from('staff')
        .select('id, name')
        .in('id', staffIds);

      if (staffError) throw staffError;

      // Combine the data
      const enrichedData = data.map(item => ({
        ...item,
        staff_name: staffData.find(s => s.id === item.staff_id)?.name || 'Unknown'
      }));

      return enrichedData as StaffPerformance[];
    },
    enabled: !!user,
  });

  return performanceQuery;
};
