
import { useQueryClient } from '@tanstack/react-query';
import { supabaseApi } from '../../services/supabaseApi';

export const useCacheManagement = () => {
  const queryClient = useQueryClient();

  const invalidateAllData = () => {
    queryClient.invalidateQueries({ queryKey: ['clients'] });
    queryClient.invalidateQueries({ queryKey: ['staff'] });
    queryClient.invalidateQueries({ queryKey: ['appointments'] });
    queryClient.invalidateQueries({ queryKey: ['client-stats'] });
  };

  const prefetchClients = (page: number, searchTerm?: string) => {
    queryClient.prefetchQuery({
      queryKey: ['clients', searchTerm, page, 50],
      queryFn: () => supabaseApi.getClients(searchTerm, page, 50),
      staleTime: 2 * 60 * 1000,
    });
  };

  return {
    invalidateAllData,
    prefetchClients,
  };
};
