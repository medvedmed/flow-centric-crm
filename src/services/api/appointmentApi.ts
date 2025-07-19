
import { supabase } from '@/integrations/supabase/client';
import { Appointment } from '@/services/types';
import { RetryService } from '@/services/errorHandling/retryService';
import { EnhancedValidator, AppointmentValidationRules } from '@/services/validation/enhancedValidation';

export const appointmentApi = {
  async createAppointment(appointment: Appointment): Promise<Appointment> {
    // Validate appointment data
    const validation = EnhancedValidator.validate(appointment, AppointmentValidationRules);
    if (!validation.isValid) {
      const errorMessage = Object.values(validation.errors).flat().join(', ');
      throw new Error(`Validation failed: ${errorMessage}`);
    }

    return RetryService.withRetry(async () => {
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
      return data;
    }, {
      maxAttempts: 3,
      onRetry: (attempt, error) => {
        console.warn(`Appointment creation attempt ${attempt} failed:`, error);
      }
    }).then(data => ({
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
    }));
  },

  async getAppointments(
    clientId?: string,
    staffId?: string,
    startDate?: string,
    endDate?: string,
    page: number = 1,
    pageSize: number = 100
  ): Promise<Appointment[]> {
    return RetryService.withRetry(async () => {
      const query = supabase.from('appointments').select('*');

      if (clientId) query.eq('client_id', clientId);
      if (staffId) query.eq('staff_id', staffId);
      if (startDate) query.gte('date', startDate);
      if (endDate) query.lte('date', endDate);

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, error } = await query.range(from, to).order('start_time', { ascending: true });
      if (error) throw error;
      
      return data;
    }, {
      maxAttempts: 2,
      onRetry: (attempt, error) => {
        console.warn(`Appointments fetch attempt ${attempt} failed:`, error);
      }
    }).then(data =>
      data.map((item) => ({
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
      }))
    );
  },

  async updateAppointment(id: string, updates: Partial<Appointment>): Promise<Appointment> {
    return RetryService.withRetry(async () => {
      const { data, error } = await supabase
        .from('appointments')
        .update({
          ...updates,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    }, {
      maxAttempts: 3,
      onRetry: (attempt, error) => {
        console.warn(`Appointment update attempt ${attempt} failed:`, error);
      }
    }).then(data => ({
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
    }));
  },


  async deleteAppointment(id: string): Promise<void> {
    return RetryService.withRetry(async () => {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id);

      if (error) throw error;
    }, {
      maxAttempts: 3,
      onRetry: (attempt, error) => {
        console.warn(`Appointment deletion attempt ${attempt} failed:`, error);
      }
    });
  }
};
