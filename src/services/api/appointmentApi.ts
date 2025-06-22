
import { supabase } from '@/integrations/supabase/client';
import { Appointment, PaginatedResult } from '../types';

export const appointmentApi = {
  async getAppointments(
    clientId?: string,
    staffId?: string,
    startDate?: string,
    endDate?: string,
    page: number = 1,
    pageSize: number = 100
  ): Promise<PaginatedResult<Appointment>> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from('appointments')
      .select('*')
      .eq('salon_id', user.id);
    
    if (clientId) {
      query = query.eq('client_id', clientId);
    }
    
    if (staffId) {
      query = query.eq('staff_id', staffId);
    }

    if (startDate && endDate) {
      query = query.gte('date', startDate).lte('date', endDate);
    } else if (startDate) {
      query = query.gte('date', startDate);
    } else if (endDate) {
      query = query.lte('date', endDate);
    }
    
    const { data, error, count } = await query
      .order('date', { ascending: true })
      .order('start_time', { ascending: true })
      .range(from, to);
    
    if (error) throw error;
    
    const appointments = data?.map(appointment => ({
      id: appointment.id,
      clientId: appointment.client_id,
      staffId: appointment.staff_id,
      clientName: appointment.client_name,
      clientPhone: appointment.client_phone,
      service: appointment.service,
      startTime: appointment.start_time,
      endTime: appointment.end_time,
      date: appointment.date,
      price: appointment.price,
      duration: appointment.duration,
      status: appointment.status as Appointment['status'],
      notes: appointment.notes,
      salonId: appointment.salon_id,
      createdAt: appointment.created_at,
      updatedAt: appointment.updated_at
    })) || [];

    return {
      data: appointments,
      count: count || 0,
      hasMore: (count || 0) > page * pageSize,
      page,
      pageSize
    };
  },

  async createAppointment(appointment: Appointment): Promise<Appointment> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('appointments')
      .insert({
        client_id: appointment.clientId,
        staff_id: appointment.staffId,
        client_name: appointment.clientName,
        client_phone: appointment.clientPhone,
        service: appointment.service,
        start_time: appointment.startTime,
        end_time: appointment.endTime,
        date: appointment.date,
        price: appointment.price,
        duration: appointment.duration,
        status: appointment.status,
        notes: appointment.notes,
        salon_id: user.id
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      clientId: data.client_id,
      staffId: data.staff_id,
      clientName: data.client_name,
      clientPhone: data.client_phone,
      service: data.service,
      startTime: data.start_time,
      endTime: data.end_time,
      date: data.date,
      price: data.price,
      duration: data.duration,
      status: data.status as Appointment['status'],
      notes: data.notes,
      salonId: data.salon_id,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  },

  async updateAppointment(id: string, appointment: Partial<Appointment>): Promise<Appointment> {
    const { data, error } = await supabase
      .from('appointments')
      .update({
        client_id: appointment.clientId,
        staff_id: appointment.staffId,
        client_name: appointment.clientName,
        client_phone: appointment.clientPhone,
        service: appointment.service,
        start_time: appointment.startTime,
        end_time: appointment.endTime,
        date: appointment.date,
        price: appointment.price,
        duration: appointment.duration,
        status: appointment.status,
        notes: appointment.notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      clientId: data.client_id,
      staffId: data.staff_id,
      clientName: data.client_name,
      clientPhone: data.client_phone,
      service: data.service,
      startTime: data.start_time,
      endTime: data.end_time,
      date: data.date,
      price: data.price,
      duration: data.duration,
      status: data.status as Appointment['status'],
      notes: data.notes,
      salonId: data.salon_id,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  },

  async deleteAppointment(id: string): Promise<void> {
    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};
