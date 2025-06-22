
import { supabase } from '@/integrations/supabase/client';
import { ReminderSettings, AppointmentReminder } from '../types';

export const reminderApi = {
  async getReminderSettings(): Promise<ReminderSettings | null> {
    try {
      const { data, error } = await supabase
        .rpc('get_reminder_settings');
      
      if (error) {
        console.error('Error fetching reminder settings:', error);
        return null;
      }
      
      if (!data || data.length === 0) return null;
      
      const settings = data[0];
      return {
        id: settings.id,
        salonId: settings.salon_id,
        reminderTiming: settings.reminder_timing as '24_hours' | '2_hours',
        isEnabled: settings.is_enabled,
        messageTemplate: settings.message_template,
        createdAt: settings.created_at,
        updatedAt: settings.updated_at
      };
    } catch (error) {
      console.error('Error in getReminderSettings:', error);
      return null;
    }
  },

  async createReminderSettings(settings: Partial<ReminderSettings>): Promise<ReminderSettings> {
    const { data, error } = await supabase
      .rpc('create_reminder_settings', {
        reminder_timing_param: settings.reminderTiming,
        is_enabled_param: settings.isEnabled,
        message_template_param: settings.messageTemplate
      });
    
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
      .rpc('update_reminder_settings', {
        reminder_timing_param: settings.reminderTiming,
        is_enabled_param: settings.isEnabled,
        message_template_param: settings.messageTemplate
      });
    
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
    const { data, error } = await supabase
      .rpc('get_appointment_reminders', {
        status_filter: status || null
      });
    
    if (error) throw error;
    
    return (data || []).map((item: any) => ({
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
      .rpc('update_reminder_status', {
        reminder_id: id,
        new_status: status
      });
    
    if (error) throw error;
  },

  async processReminders(): Promise<void> {
    const { error } = await supabase.functions.invoke('process-reminders');
    if (error) throw error;
  }
};
