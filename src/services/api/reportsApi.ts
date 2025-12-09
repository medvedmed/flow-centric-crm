
import { supabase } from '@/integrations/supabase/client';
import { startOfMonth, subMonths, format } from 'date-fns';

export interface RevenueData { month: string; revenue: number; appointments: number; clients: number; }
export interface ServicePopularity { service: string; count: number; revenue: number; }
export interface StaffPerformance { name: string; appointments: number; revenue: number; rating: number; }
export interface ClientMetrics { totalClients: number; newClients: number; returningClients: number; averageSpent: number; }

export const reportsApi = {
  async getRevenueData(months: number = 6): Promise<RevenueData[]> {
    const endDate = new Date();
    const startDate = subMonths(endDate, months - 1);
    
    const { data: appointments, error } = await supabase
      .from('appointments')
      .select('start_time, status')
      .gte('start_time', format(startDate, 'yyyy-MM-01'))
      .lte('start_time', format(endDate, 'yyyy-MM-dd'))
      .eq('status', 'Completed');

    if (error) throw error;

    const monthlyData: { [key: string]: RevenueData } = {};
    for (let i = 0; i < months; i++) {
      const date = subMonths(endDate, months - 1 - i);
      monthlyData[format(date, 'yyyy-MM')] = { month: format(date, 'MMM'), revenue: 0, appointments: 0, clients: 0 };
    }

    appointments?.forEach(apt => {
      const monthKey = format(new Date(apt.start_time), 'yyyy-MM');
      if (monthlyData[monthKey]) monthlyData[monthKey].appointments += 1;
    });

    return Object.values(monthlyData);
  },

  async getServicePopularity(): Promise<ServicePopularity[]> {
    const { data: services, error } = await supabase.from('services').select('id, name, price');
    if (error) throw error;
    return (services || []).map(s => ({ service: s.name, count: 0, revenue: 0 }));
  },

  async getStaffPerformance(): Promise<StaffPerformance[]> {
    const { data: staff, error } = await supabase.from('staff').select('id, name, rating');
    if (error) throw error;
    return (staff || []).map(s => ({ name: s.name, appointments: 0, revenue: 0, rating: s.rating || 5 }));
  },

  async getClientMetrics(): Promise<ClientMetrics> {
    const { data: clients, error } = await supabase.from('clients').select('id, created_at, total_spent');
    if (error) throw error;
    const currentMonth = startOfMonth(new Date());
    const total = clients?.length || 0;
    const newClients = clients?.filter(c => new Date(c.created_at || '') >= currentMonth).length || 0;
    const totalSpent = clients?.reduce((sum, c) => sum + (c.total_spent || 0), 0) || 0;
    return { totalClients: total, newClients, returningClients: 0, averageSpent: total > 0 ? totalSpent / total : 0 };
  },

  async exportReport(type: 'revenue' | 'services' | 'staff' | 'clients'): Promise<void> {
    let data: any[] = [];
    let filename = `${type}-report.csv`;
    switch (type) {
      case 'revenue': data = await this.getRevenueData(12); break;
      case 'services': data = await this.getServicePopularity(); break;
      case 'staff': data = await this.getStaffPerformance(); break;
      case 'clients': data = [await this.getClientMetrics()]; break;
    }
    if (data.length === 0) return;
    const csv = Object.keys(data[0]).join(',') + '\n' + data.map(r => Object.values(r).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  }
};
