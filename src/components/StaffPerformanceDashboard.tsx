
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, TrendingUp, Calendar, DollarSign } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface StaffPerformance {
  id: string;
  staff_id: string;
  month: string;
  total_clients: number;
  new_clients: number;
  regular_clients: number;
  total_revenue: number;
  appointments_completed: number;
  staff_name: string;
}

export const StaffPerformanceDashboard = () => {
  const { user } = useAuth();

  const { data: performanceData = [], isLoading } = useQuery({
    queryKey: ['staff-performance'],
    queryFn: async () => {
      const currentMonth = new Date().toISOString().slice(0, 7) + '-01';
      
      const { data, error } = await supabase
        .from('staff_performance')
        .select(`
          *
        `)
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

  const { data: clientCategorizationData = [] } = useQuery({
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
      
      return result;
    },
    enabled: !!user,
  });

  if (isLoading) {
    return <div>Loading staff performance...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Staff Performance (This Month)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {performanceData.map((staff) => (
              <div key={staff.id} className="flex justify-between items-center p-4 border rounded-lg">
                <div>
                  <h3 className="font-semibold">{staff.staff_name}</h3>
                  <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                    <span>{staff.appointments_completed} appointments</span>
                    <span>{staff.total_clients} clients</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-lg">${staff.total_revenue.toFixed(2)}</div>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="secondary">{staff.new_clients} new</Badge>
                    <Badge variant="outline">{staff.regular_clients} regular</Badge>
                  </div>
                </div>
              </div>
            ))}
            {performanceData.length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                No performance data available for this month
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Client Distribution (Last 30 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {clientCategorizationData.map((staff) => (
              <div key={staff.staff_id} className="flex justify-between items-center p-4 border rounded-lg">
                <div>
                  <h3 className="font-semibold">{staff.staff_name}</h3>
                  <div className="text-sm text-muted-foreground">
                    Total clients served: {staff.total_clients}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    {staff.new_clients} New
                  </Badge>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    {staff.regular_clients} Regular
                  </Badge>
                </div>
              </div>
            ))}
            {clientCategorizationData.length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                No client data available for the last 30 days
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
