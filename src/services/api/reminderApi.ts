
import { supabase } from '@/integrations/supabase/client';
import { ReminderSettings, AppointmentReminder } from '../types';

export const reminderApi = {
  async getReminderSettings(): Promise<ReminderSettings | null> {
    const { data, error } = await supabase
      .from('reminder_settings')
      .select('*')
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null; // No rows returned
      throw error;
    }
    
    return {
      id: data.id,
      salonId: data.salon_id,
      reminderTiming: data.reminder_timing as '24_hours' | '2_hours',
      isEnabled: data.is_enabled,
      messageTemplate: data.message_template,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  },

  async createReminderSettings(settings: Partial<ReminderSettings>): Promise<ReminderSettings> {
    const { data, error } = await supabase
      .from('reminder_settings')
      .insert({
        reminder_timing: settings.reminderTiming,
        is_enabled: settings.isEnabled,
        message_template: settings.messageTemplate,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      salonId: data.salon_id,
      reminderTiming: data.reminder_timing as '24_hours' | '2_hours',
      isEnabled: data.is_enabled,
      messageTemplate: data.message_template,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  },

  async updateReminderSettings(settings: Partial<ReminderSettings>): Promise<ReminderSettings> {
    const { data, error } = await supabase
      .from('reminder_settings')
      .update({
        reminder_timing: settings.reminderTiming,
        is_enabled: settings.isEnabled,
        message_template: settings.messageTemplate,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      salonId: data.salon_id,
      reminderTiming: data.reminder_timing as '24_hours' | '2_hours',
      isEnabled: data.is_enabled,
      messageTemplate: data.message_template,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  },

  async getAppointmentReminders(status?: string): Promise<AppointmentReminder[]> {
    let query = supabase
      .from('appointment_reminders')
      .select(`
        *,
        appointments!inner(
          id,
          client_name,
          service,
          date,
          start_time,
          salon_id
        )
      `)
      .order('scheduled_time', { ascending: true });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    
    if (error) throw error;
    
    return data.map(item => ({
      id: item.id,
      appointmentId: item.appointment_id,
      reminderType: item.reminder_type as '24_hours' | '2_hours',
      scheduledTime: item.scheduled_time,
      sentAt: item.sent_at,
      status: item.status as 'pending' | 'ready' | 'sent' | 'skipped',
      whatsappUrl: item.whatsapp_url,
      createdAt: item.created_at,
      updatedAt: item.updated_at
    }));
  },

  async updateReminderStatus(id: string, status: 'sent' | 'skipped'): Promise<void> {
    const { error } = await supabase
      .from('appointment_reminders')
      .update({
        status,
        sent_at: status === 'sent' ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);
    
    if (error) throw error;
  },

  async processReminders(): Promise<void> {
    const { error } = await supabase.functions.invoke('process-reminders');
    if (error) throw error;
  }
};
