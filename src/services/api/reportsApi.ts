
import { supabase } from '@/integrations/supabase/client';
import { startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths, format } from 'date-fns';

export interface RevenueData {
  month: string;
  revenue: number;
  appointments: number;
  clients: number;
}

export interface ServicePopularity {
  service: string;
  count: number;
  revenue: number;
}

export interface StaffPerformance {
  name: string;
  appointments: number;
  revenue: number;
  rating: number;
}

export interface ClientMetrics {
  totalClients: number;
  newClients: number;
  returningClients: number;
  averageSpent: number;
}

export const reportsApi = {
  async getRevenueData(months: number = 6): Promise<RevenueData[]> {
    const endDate = new Date();
    const startDate = subMonths(endDate, months - 1);
    
    const { data: appointments, error } = await supabase
      .from('appointments')
      .select('date, price, status')
      .gte('date', format(startDate, 'yyyy-MM-01'))
      .lte('date', format(endDate, 'yyyy-MM-dd'))
      .eq('status', 'Completed');

    if (error) throw error;

    // Group by month and calculate metrics
    const monthlyData: { [key: string]: RevenueData } = {};
    
    for (let i = 0; i < months; i++) {
      const date = subMonths(endDate, months - 1 - i);
      const monthKey = format(date, 'yyyy-MM');
      const monthName = format(date, 'MMM');
      
      monthlyData[monthKey] = {
        month: monthName,
        revenue: 0,
        appointments: 0,
        clients: 0
      };
    }

    appointments?.forEach(appointment => {
      const monthKey = format(new Date(appointment.date), 'yyyy-MM');
      if (monthlyData[monthKey]) {
        monthlyData[monthKey].revenue += Number(appointment.price) || 0;
        monthlyData[monthKey].appointments += 1;
      }
    });

    return Object.values(monthlyData);
  },

  async getServicePopularity(): Promise<ServicePopularity[]> {
    const { data: appointments, error } = await supabase
      .from('appointments')
      .select('service, price, status')
      .eq('status', 'Completed')
      .gte('date', format(startOfMonth(new Date()), 'yyyy-MM-dd'));

    if (error) throw error;

    const serviceMap: { [key: string]: ServicePopularity } = {};
    
    appointments?.forEach(appointment => {
      const service = appointment.service;
      if (!serviceMap[service]) {
        serviceMap[service] = {
          service,
          count: 0,
          revenue: 0
        };
      }
      serviceMap[service].count += 1;
      serviceMap[service].revenue += Number(appointment.price) || 0;
    });

    return Object.values(serviceMap).sort((a, b) => b.count - a.count);
  },

  async getStaffPerformance(): Promise<StaffPerformance[]> {
    const { data: staff, error: staffError } = await supabase
      .from('staff')
      .select('id, name, rating');

    if (staffError) throw staffError;

    const { data: appointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select('staff_id, price, status')
      .eq('status', 'Completed')
      .gte('date', format(startOfMonth(new Date()), 'yyyy-MM-dd'));

    if (appointmentsError) throw appointmentsError;

    const staffMap: { [key: string]: StaffPerformance } = {};
    
    staff?.forEach(member => {
      staffMap[member.id] = {
        name: member.name,
        appointments: 0,
        revenue: 0,
        rating: Number(member.rating) || 5.0
      };
    });

    appointments?.forEach(appointment => {
      if (appointment.staff_id && staffMap[appointment.staff_id]) {
        staffMap[appointment.staff_id].appointments += 1;
        staffMap[appointment.staff_id].revenue += Number(appointment.price) || 0;
      }
    });

    return Object.values(staffMap).sort((a, b) => b.revenue - a.revenue);
  },

  async getClientMetrics(): Promise<ClientMetrics> {
    const currentMonth = startOfMonth(new Date());
    const lastMonth = startOfMonth(subMonths(new Date(), 1));

    const { data: allClients, error: clientsError } = await supabase
      .from('clients')
      .select('id, created_at, total_spent, visits');

    if (clientsError) throw clientsError;

    const { data: thisMonthAppointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select('client_id')
      .gte('date', format(currentMonth, 'yyyy-MM-dd'))
      .eq('status', 'Completed');

    if (appointmentsError) throw appointmentsError;

    const totalClients = allClients?.length || 0;
    const newClients = allClients?.filter(client => 
      new Date(client.created_at) >= currentMonth
    ).length || 0;
    
    const returningClientIds = new Set(
      thisMonthAppointments?.map(apt => apt.client_id).filter(Boolean)
    );
    const returningClients = Array.from(returningClientIds).length;

    const totalSpent = allClients?.reduce((sum, client) => 
      sum + (Number(client.total_spent) || 0), 0
    ) || 0;
    const averageSpent = totalClients > 0 ? totalSpent / totalClients : 0;

    return {
      totalClients,
      newClients,
      returningClients,
      averageSpent
    };
  },

  async exportReport(type: 'revenue' | 'services' | 'staff' | 'clients'): Promise<void> {
    let data: any[] = [];
    let filename = '';

    switch (type) {
      case 'revenue':
        data = await this.getRevenueData(12);
        filename = 'revenue-report.csv';
        break;
      case 'services':
        data = await this.getServicePopularity();
        filename = 'services-report.csv';
        break;
      case 'staff':
        data = await this.getStaffPerformance();
        filename = 'staff-report.csv';
        break;
      case 'clients':
        const metrics = await this.getClientMetrics();
        data = [metrics];
        filename = 'client-metrics.csv';
        break;
    }

    // Convert to CSV
    if (data.length === 0) return;
    
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => Object.values(row).join(',')).join('\n');
    const csv = headers + '\n' + rows;

    // Download file
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }
};
