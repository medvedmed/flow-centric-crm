
import { supabase } from '@/integrations/supabase/client';

export interface AppointmentService {
  id: string;
  appointment_id: string;
  service_name: string;
  service_price: number;
  service_duration: number;
  staff_id?: string;
  created_at: string;
}

export interface CreateAppointmentService {
  service_name: string;
  service_price: number;
  service_duration: number;
  staff_id?: string;
}

export interface EnhancedAppointment {
  id: string;
  client_id?: string;
  client_name?: string;
  client_phone?: string;
  date?: string;
  start_time: string;
  end_time: string;
  service?: string;
  service_id?: string;
  staff_id?: string;
  status: string;
  price?: number;
  duration?: number;
  notes?: string;
  organization_id?: string;
  created_at?: string;
  updated_at?: string;
  services?: AppointmentService[];
  clients?: { full_name: string; phone: string };
  servicesData?: { name: string; price: number };
}

export const enhancedAppointmentApi = {
  async getAppointmentServices(appointmentId: string) {
    const { data, error } = await supabase
      .from('appointment_services')
      .select('*')
      .eq('appointment_id', appointmentId)
      .order('created_at');

    if (error) throw error;
    return data || [];
  },

  async addServiceToAppointment(appointmentId: string, service: CreateAppointmentService) {
    const { data, error } = await supabase
      .from('appointment_services')
      .insert([{
        ...service,
        appointment_id: appointmentId
      }])
      .select()
      .single();

    if (error) throw error;

    const services = await this.getAppointmentServices(appointmentId);
    const totalPrice = services.reduce((sum, s) => sum + Number(s.service_price), 0);
    const totalDuration = services.reduce((sum, s) => sum + s.service_duration, 0);

    const { error: updateError } = await supabase
      .from('appointments')
      .update({
        duration: totalDuration
      })
      .eq('id', appointmentId);

    if (updateError) throw updateError;

    return data;
  },

  async removeServiceFromAppointment(serviceId: string) {
    const { data: service, error: fetchError } = await supabase
      .from('appointment_services')
      .select('appointment_id')
      .eq('id', serviceId)
      .single();

    if (fetchError) throw fetchError;

    const { error } = await supabase
      .from('appointment_services')
      .delete()
      .eq('id', serviceId);

    if (error) throw error;

    const services = await this.getAppointmentServices(service.appointment_id);
    const totalDuration = services.reduce((sum, s) => sum + s.service_duration, 0);

    await supabase
      .from('appointments')
      .update({
        duration: totalDuration
      })
      .eq('id', service.appointment_id);
  },

  async getAppointmentWithServices(appointmentId: string): Promise<EnhancedAppointment | null> {
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', appointmentId)
      .single();

    if (appointmentError) throw appointmentError;
    if (!appointment) return null;

    // Get related data
    const [clientRes, serviceRes] = await Promise.all([
      appointment.client_id ? supabase.from('clients').select('full_name, phone').eq('id', appointment.client_id).maybeSingle() : { data: null },
      appointment.service_id ? supabase.from('services').select('name, price').eq('id', appointment.service_id).maybeSingle() : { data: null }
    ]);

    const appointmentServices = await this.getAppointmentServices(appointmentId);

    return {
      id: appointment.id,
      client_id: appointment.client_id,
      client_name: clientRes.data?.full_name || '',
      client_phone: clientRes.data?.phone || '',
      date: appointment.start_time?.split('T')[0] || '',
      start_time: appointment.start_time,
      end_time: appointment.end_time,
      service: serviceRes.data?.name || '',
      service_id: appointment.service_id,
      staff_id: appointment.staff_id,
      status: appointment.status,
      price: serviceRes.data?.price || 0,
      duration: appointment.duration,
      notes: appointment.notes,
      organization_id: appointment.organization_id,
      created_at: appointment.created_at,
      updated_at: appointment.updated_at,
      services: appointmentServices
    };
  },

  async createMultiServiceAppointment(
    appointmentData: any,
    services: CreateAppointmentService[]
  ) {
    const totalDuration = services.reduce((sum, service) => sum + service.service_duration, 0);

    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .insert([{
        ...appointmentData,
        duration: totalDuration
      }])
      .select()
      .single();

    if (appointmentError) throw appointmentError;

    const servicePromises = services.map(service =>
      this.addServiceToAppointment(appointment.id, service)
    );

    await Promise.all(servicePromises);

    return this.getAppointmentWithServices(appointment.id);
  }
};
