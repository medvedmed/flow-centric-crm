
import { supabase } from '@/integrations/supabase/client';
import { Appointment } from '@/services/types';

export const appointmentApi = {
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
        duration: appointment.duration || 60,
        status: appointment.status || 'Scheduled',
        notes: appointment.notes,
        salon_id: user.id,
        color: appointment.color,
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
      updatedAt: data.updated_at,
      color: data.color,
    };
  },

  async getAppointments(
    clientId?: string,
    staffId?: string,
    startDate?: string,
    endDate?: string,
    page: number = 1,
    pageSize: number = 100
  ): Promise<Appointment[]> {
    const query = supabase.from('appointments').select('*');

    if (clientId) query.eq('client_id', clientId);
    if (staffId) query.eq('staff_id', staffId);
    if (startDate) query.gte('date', startDate);
    if (endDate) query.lte('date', endDate);

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error } = await query.range(from, to).order('start_time', { ascending: true });
    if (error) throw error;

    return data.map((item) => ({
      id: item.id,
      clientId: item.client_id,
      staffId: item.staff_id,
      clientName: item.client_name,
      clientPhone: item.client_phone,
      service: item.service,
      startTime: item.start_time,
      endTime: item.end_time,
      date: item.date,
      price: item.price,
      duration: item.duration,
      status: item.status as Appointment['status'],
      notes: item.notes,
      salonId: item.salon_id,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
      color: item.color,
    }));
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
      color: appointment.color // <-- this is important
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
    updatedAt: data.updated_at,
    color: data.color
  };
}


  async deleteAppointment(id: string): Promise<void> {
    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
