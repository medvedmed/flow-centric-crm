
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { ClientCategorization } from './types';

export const useClientCategorizationData = () => {
  const { user } = useAuth();

  const clientCategorizationQuery = useQuery({
    queryKey: ['client-categorization'],
    queryFn: async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          staff_id,
          client_id,
          client_name,
          date
        `)
        .eq('salon_id', user?.id)
        .eq('status', 'Completed')
        .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
        .order('date', { ascending: false });

      if (error) throw error;

      // Get staff names
      const staffIds = [...new Set(data.map(item => item.staff_id))];
      const { data: staffData } = await supabase
        .from('staff')
        .select('id, name')
        .in('id', staffIds);

      // Categorize clients by staff
      const staffClientMap = new Map();
      
      data.forEach(appointment => {
        const staffId = appointment.staff_id;
        const clientId = appointment.client_id;
        const staffName = staffData?.find(s => s.id === staffId)?.name || 'Unknown';
        
        if (!staffClientMap.has(staffId)) {
          staffClientMap.set(staffId, {
            staff_name: staffName,
            clients: new Map(),
            total_clients: 0,
            new_clients: 0,
            regular_clients: 0
          });
        }
        
        const staffData_item = staffClientMap.get(staffId);
        
        if (!staffData_item.clients.has(clientId)) {
          staffData_item.clients.set(clientId, {
            name: appointment.client_name,
            visits: 0,
            first_visit: appointment.date
          });
        }
        
        staffData_item.clients.get(clientId).visits++;
      });

      // Calculate categorization
      const result = [];
      for (const [staffId, staffData_item] of staffClientMap) {
        let newClients = 0;
        let regularClients = 0;
        
        for (const [clientId, clientData] of staffData_item.clients) {
          if (clientData.visits === 1) {
            newClients++;
          } else {
            regularClients++;
          }
        }
        
        result.push({
          staff_id: staffId,
          staff_name: staffData_item.staff_name,
          total_clients: staffData_item.clients.size,
          new_clients: newClients,
          regular_clients: regularClients
        });
      }
      
      return result as ClientCategorization[];
    },
    enabled: !!user,
  });

  return clientCategorizationQuery;
};
