
import { supabase } from '@/integrations/supabase/client';

export interface ClientRetentionData {
  id: string;
  salon_id: string;
  client_id: string;
  staff_id?: string;
  total_visits: number;
  first_visit_date: string;
  last_visit_date: string;
  client_category: 'New' | 'Returning' | 'Loyal';
  days_since_last_visit: number;
  total_spent: number;
  average_days_between_visits?: number;
}

export interface StaffRetentionMetrics {
  staff_id: string;
  staff_name: string;
  total_unique_clients: number;
  new_clients: number;
  returning_clients: number;
  loyal_clients: number;
  retention_rate: number;
}

export interface RetentionSummary {
  totalClients: number;
  newClients: number;
  returningClients: number;
  loyalClients: number;
  overallRetentionRate: number;
  averageVisitsPerClient: number;
}

export const retentionApi = {
  // Get staff retention metrics for a specific period
  async getStaffRetentionMetrics(
    startDate?: string,
    endDate?: string
  ): Promise<StaffRetentionMetrics[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase.rpc('calculate_staff_retention_metrics', {
      target_salon_id: user.id,
      start_date: startDate || null,
      end_date: endDate || null
    });

    if (error) throw error;
    return data || [];
  },

  // Get client retention analytics
  async getClientRetentionData(filters?: {
    staffId?: string;
    clientCategory?: 'New' | 'Returning' | 'Loyal';
    startDate?: string;
    endDate?: string;
  }): Promise<ClientRetentionData[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    let query = supabase
      .from('client_retention_analytics')
      .select(`
        *,
        clients!inner(name, email, phone)
      `)
      .eq('salon_id', user.id)
      .order('last_visit_date', { ascending: false });

    if (filters?.staffId) {
      query = query.eq('staff_id', filters.staffId);
    }
    if (filters?.clientCategory) {
      query = query.eq('client_category', filters.clientCategory);
    }

    const { data, error } = await query;
    if (error) throw error;

    return data || [];
  },

  // Get retention summary metrics
  async getRetentionSummary(
    startDate?: string,
    endDate?: string
  ): Promise<RetentionSummary> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Get client retention data with date filtering if needed
    let query = supabase
      .from('client_retention_analytics')
      .select('*')
      .eq('salon_id', user.id);

    if (startDate || endDate) {
      // Join with appointments to filter by date
      const appointmentsQuery = supabase
        .from('appointments')
        .select('client_id')
        .eq('salon_id', user.id)
        .eq('status', 'Completed');

      if (startDate) appointmentsQuery.gte('date', startDate);
      if (endDate) appointmentsQuery.lte('date', endDate);

      const { data: appointmentClients } = await appointmentsQuery;
      const clientIds = appointmentClients?.map(a => a.client_id) || [];
      
      if (clientIds.length > 0) {
        query = query.in('client_id', clientIds);
      } else {
        return {
          totalClients: 0,
          newClients: 0,
          returningClients: 0,
          loyalClients: 0,
          overallRetentionRate: 0,
          averageVisitsPerClient: 0
        };
      }
    }

    const { data, error } = await query;
    if (error) throw error;

    const clients = data || [];
    const totalClients = clients.length;
    const newClients = clients.filter(c => c.client_category === 'New').length;
    const returningClients = clients.filter(c => c.client_category === 'Returning').length;
    const loyalClients = clients.filter(c => c.client_category === 'Loyal').length;
    const totalVisits = clients.reduce((sum, c) => sum + c.total_visits, 0);

    return {
      totalClients,
      newClients,
      returningClients,
      loyalClients,
      overallRetentionRate: totalClients > 0 ? ((returningClients + loyalClients) / totalClients) * 100 : 0,
      averageVisitsPerClient: totalClients > 0 ? totalVisits / totalClients : 0
    };
  },

  // Get client visit history
  async getClientVisitHistory(clientId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('appointments')
      .select(`
        id,
        date,
        start_time,
        service,
        price,
        status,
        staff!inner(name)
      `)
      .eq('salon_id', user.id)
      .eq('client_id', clientId)
      .eq('status', 'Completed')
      .order('date', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Get clients at risk (haven't returned in X days)
  async getClientsAtRisk(daysSinceLastVisit: number = 90) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('client_retention_analytics')
      .select(`
        *,
        clients!inner(name, email, phone)
      `)
      .eq('salon_id', user.id)
      .gt('days_since_last_visit', daysSinceLastVisit)
      .in('client_category', ['Returning', 'Loyal'])
      .order('days_since_last_visit', { ascending: false });

    if (error) throw error;
    return data || [];
  }
};
