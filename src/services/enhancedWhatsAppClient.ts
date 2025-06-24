
import { supabase } from '@/integrations/supabase/client';

export interface WhatsAppSession {
  id: string;
  salon_id: string;
  phone_number?: string;
  is_connected: boolean;
  connection_state: string;
  qr_code?: string;
  webjs_session_data?: any;
  client_info?: any;
  rate_limit_reset: string;
  messages_sent_today: number;
  last_activity: string;
}

export interface MessageQueueItem {
  id: string;
  salon_id: string;
  recipient_phone: string;
  message_content: string;
  message_type: string;
  priority: number;
  scheduled_for: string;
  attempts: number;
  max_attempts: number;
  status: 'pending' | 'processing' | 'sent' | 'failed' | 'cancelled';
  appointment_id?: string;
  reminder_type?: string;
  sent_at?: string;
  error_message?: string;
}

export interface WhatsAppContact {
  id: string;
  salon_id: string;
  phone_number: string;
  contact_name?: string;
  is_business: boolean;
  profile_pic_url?: string;
  last_seen?: string;
  is_blocked: boolean;
  client_id?: string;
}

class EnhancedWhatsAppClient {
  private readonly baseUrl = 'https://mqojlcooxwmdrygmoczi.supabase.co/functions/v1/whatsapp-webjs';

  async initializeSession(): Promise<{ success: boolean; qrCode?: string; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const response = await supabase.functions.invoke('whatsapp-webjs', {
        body: {
          action: 'initialize',
          salonId: user.id
        }
      });

      if (response.error) throw response.error;
      return response.data;
    } catch (error) {
      console.error('Error initializing WhatsApp session:', error);
      return { success: false, error: error.message };
    }
  }

  async authenticateSession(): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const response = await supabase.functions.invoke('whatsapp-webjs', {
        body: {
          action: 'authenticate',
          salonId: user.id
        }
      });

      if (response.error) throw response.error;
      return response.data;
    } catch (error) {
      console.error('Error authenticating WhatsApp session:', error);
      return { success: false, error: error.message };
    }
  }

  async sendMessage(
    recipientPhone: string,
    message: string,
    appointmentId?: string,
    reminderType?: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const response = await supabase.functions.invoke('whatsapp-webjs', {
        body: {
          action: 'send_message',
          salonId: user.id,
          recipientPhone,
          message,
          appointmentId,
          reminderType
        }
      });

      if (response.error) throw response.error;
      return response.data;
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      return { success: false, error: error.message };
    }
  }

  async getSessionStatus(): Promise<WhatsAppSession | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const response = await supabase.functions.invoke('whatsapp-webjs', {
        body: {
          action: 'get_status',
          salonId: user.id
        }
      });

      if (response.error) throw response.error;
      return response.data.session;
    } catch (error) {
      console.error('Error getting session status:', error);
      return null;
    }
  }

  async getMessageQueue(status?: string): Promise<MessageQueueItem[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const response = await supabase.functions.invoke('whatsapp-webjs', {
        body: {
          action: 'get_queue',
          salonId: user.id,
          status
        }
      });

      if (response.error) throw response.error;
      return response.data.queue || [];
    } catch (error) {
      console.error('Error getting message queue:', error);
      return [];
    }
  }

  async disconnectSession(): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const response = await supabase.functions.invoke('whatsapp-webjs', {
        body: {
          action: 'disconnect',
          salonId: user.id
        }
      });

      if (response.error) throw response.error;
      return response.data;
    } catch (error) {
      console.error('Error disconnecting session:', error);
      return { success: false, error: error.message };
    }
  }

  // Database operations for contacts and queue management
  async getContacts(): Promise<WhatsAppContact[]> {
    try {
      const { data, error } = await supabase
        .from('whatsapp_contacts')
        .select('*')
        .order('contact_name', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting contacts:', error);
      return [];
    }
  }

  async addContact(phoneNumber: string, contactName?: string, clientId?: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('whatsapp_contacts')
        .insert({
          salon_id: user.id,
          phone_number: phoneNumber,
          contact_name: contactName,
          client_id: clientId
        });

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error adding contact:', error);
      return { success: false, error: error.message };
    }
  }

  async updateContact(contactId: string, updates: Partial<WhatsAppContact>): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('whatsapp_contacts')
        .update(updates)
        .eq('id', contactId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error updating contact:', error);
      return { success: false, error: error.message };
    }
  }

  async blockContact(contactId: string): Promise<{ success: boolean; error?: string }> {
    return this.updateContact(contactId, { is_blocked: true });
  }

  async unblockContact(contactId: string): Promise<{ success: boolean; error?: string }> {
    return this.updateContact(contactId, { is_blocked: false });
  }

  // Real-time subscriptions
  subscribeToSessionUpdates(callback: (session: WhatsAppSession) => void) {
    return supabase
      .channel('whatsapp-session-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'whatsapp_sessions'
        },
        (payload) => {
          if (payload.new) {
            callback(payload.new as WhatsAppSession);
          }
        }
      )
      .subscribe();
  }

  subscribeToMessageQueue(callback: (message: MessageQueueItem) => void) {
    return supabase
      .channel('whatsapp-queue-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'whatsapp_message_queue'
        },
        (payload) => {
          if (payload.new) {
            callback(payload.new as MessageQueueItem);
          }
        }
      )
      .subscribe();
  }

  // Utility methods
  formatPhoneNumber(phone: string): string {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Add country code if not present
    if (!cleaned.startsWith('1') && cleaned.length === 10) {
      return `1${cleaned}`;
    }
    
    return cleaned;
  }

  validatePhoneNumber(phone: string): boolean {
    const cleaned = this.formatPhoneNumber(phone);
    return cleaned.length >= 10 && cleaned.length <= 15;
  }

  async sendAppointmentReminder(appointmentId: string, clientPhone: string, clientName: string, service: string, appointmentTime: string, appointmentDate: string): Promise<{ success: boolean; error?: string }> {
    const message = `Hi ${clientName}! This is a reminder for your ${service} appointment on ${appointmentDate} at ${appointmentTime}. See you at the salon! 💫`;
    
    return this.sendMessage(
      this.formatPhoneNumber(clientPhone),
      message,
      appointmentId,
      'appointment_reminder'
    );
  }

  async sendFollowUpMessage(appointmentId: string, clientPhone: string, clientName: string, service: string): Promise<{ success: boolean; error?: string }> {
    const message = `Hi ${clientName}! How was your ${service} appointment? We'd love your feedback and hope to see you again soon! ⭐`;
    
    return this.sendMessage(
      this.formatPhoneNumber(clientPhone),
      message,
      appointmentId,
      'follow_up'
    );
  }
}

export const enhancedWhatsAppClient = new EnhancedWhatsAppClient();
