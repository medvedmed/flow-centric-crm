
import { supabase } from '@/integrations/supabase/client';
import { Appointment } from '@/services/types';
import { RetryService } from '@/services/errorHandling/retryService';
import { EnhancedValidator, AppointmentValidationRules } from '@/services/validation/enhancedValidation';

export const appointmentApi = {
  async createAppointment(appointment: Appointment): Promise<Appointment> {
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
          start_time: appointment.startTime,
          end_time: appointment.endTime,
          duration: appointment.duration || 60,
          status: appointment.status || 'Scheduled',
          notes: appointment.notes,
          organization_id: user.id,
          color: appointment.color,
        })
        .select()
        .single();

      if (error) throw error;
      
      return {
        id: data.id,
        clientId: data.client_id || '',
        staffId: data.staff_id || '',
        clientName: '',
        clientPhone: '',
        service: '',
        startTime: data.start_time,
        endTime: data.end_time,
        date: data.start_time?.split('T')[0] || '',
        price: 0,
        duration: data.duration,
        status: data.status as Appointment['status'],
        notes: data.notes || '',
        salonId: data.organization_id || '',
        createdAt: data.created_at || '',
        updatedAt: data.updated_at || '',
        color: data.color || '',
      };
    }, { maxAttempts: 3 });
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
      if (startDate) query.gte('start_time', startDate);
      if (endDate) query.lte('start_time', endDate);

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, error } = await query.range(from, to).order('start_time', { ascending: true });
      if (error) throw error;
      
      return (data || []).map((item: any) => ({
        id: item.id,
        clientId: item.client_id || '',
        staffId: item.staff_id || '',
        clientName: '',
        clientPhone: '',
        service: '',
        startTime: item.start_time,
        endTime: item.end_time,
        date: item.start_time?.split('T')[0] || '',
        price: 0,
        duration: item.duration,
        status: item.status as Appointment['status'],
        notes: item.notes || '',
        salonId: item.organization_id || '',
        createdAt: item.created_at || '',
        updatedAt: item.updated_at || '',
        color: item.color || '',
      }));
    }, { maxAttempts: 2 });
  },

  async updateAppointment(id: string, updates: Partial<Appointment>): Promise<Appointment> {
    return RetryService.withRetry(async () => {
      const dbUpdates: any = {};
      if (updates.clientId !== undefined) dbUpdates.client_id = updates.clientId;
      if (updates.staffId !== undefined) dbUpdates.staff_id = updates.staffId;
      if (updates.startTime !== undefined) dbUpdates.start_time = updates.startTime;
      if (updates.endTime !== undefined) dbUpdates.end_time = updates.endTime;
      if (updates.duration !== undefined) dbUpdates.duration = updates.duration;
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
      if (updates.color !== undefined) dbUpdates.color = updates.color;

      const { data, error } = await supabase
        .from('appointments')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      return {
        id: data.id,
        clientId: data.client_id || '',
        staffId: data.staff_id || '',
        clientName: '',
        clientPhone: '',
        service: '',
        startTime: data.start_time,
        endTime: data.end_time,
        date: data.start_time?.split('T')[0] || '',
        price: 0,
        duration: data.duration,
        status: data.status as Appointment['status'],
        notes: data.notes || '',
        salonId: data.organization_id || '',
        createdAt: data.created_at || '',
        updatedAt: data.updated_at || '',
        color: data.color || '',
      };
    }, { maxAttempts: 3 });
  },

  async deleteAppointment(id: string): Promise<void> {
    return RetryService.withRetry(async () => {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id);

      if (error) throw error;
    }, { maxAttempts: 3 });
  }
};
