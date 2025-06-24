
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
  client_name: string;
  client_phone?: string;
  date: string;
  start_time: string;
  end_time: string;
  service: string;
  staff_id?: string;
  status: string;
  price?: number;
  duration?: number;
  notes?: string;
  salon_id?: string;
  created_at?: string;
  updated_at?: string;
  services?: AppointmentService[];
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

    // Update appointment total price and duration
    const services = await this.getAppointmentServices(appointmentId);
    const totalPrice = services.reduce((sum, s) => sum + Number(s.service_price), 0);
    const totalDuration = services.reduce((sum, s) => sum + s.service_duration, 0);

    // Update the main appointment record
    const { error: updateError } = await supabase
      .from('appointments')
      .update({
        price: totalPrice,
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

    // Recalculate appointment totals
    const services = await this.getAppointmentServices(service.appointment_id);
    const totalPrice = services.reduce((sum, s) => sum + Number(s.service_price), 0);
    const totalDuration = services.reduce((sum, s) => sum + s.service_duration, 0);

    await supabase
      .from('appointments')
      .update({
        price: totalPrice,
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

    const services = await this.getAppointmentServices(appointmentId);

    return {
      ...appointment,
      services
    };
  },

  async createMultiServiceAppointment(
    appointmentData: any,
    services: CreateAppointmentService[]
  ) {
    // Calculate total price and duration
    const totalPrice = services.reduce((sum, service) => sum + service.service_price, 0);
    const totalDuration = services.reduce((sum, service) => sum + service.service_duration, 0);

    // Create the main appointment
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .insert([{
        ...appointmentData,
        price: totalPrice,
        duration: totalDuration
      }])
      .select()
      .single();

    if (appointmentError) throw appointmentError;

    // Add all services
    const servicePromises = services.map(service =>
      this.addServiceToAppointment(appointment.id, service)
    );

    await Promise.all(servicePromises);

    return this.getAppointmentWithServices(appointment.id);
  }
};
