
import { supabase } from '@/integrations/supabase/client';

export interface WhatsAppServerSession {
  id: string;
  is_connected: boolean;
  connection_state: 'disconnected' | 'connecting' | 'connected' | 'ready';
  phone_number?: string;
  qr_code?: string;
  last_connected_at?: string;
  webjs_session_data?: any;
}

export interface WhatsAppServerMessage {
  id: string;
  recipient_phone: string;
  recipient_name?: string;
  message_content: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  sent_at?: string;
  error_message?: string;
}

class WhatsAppServerClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = 'http://localhost:3020';
  }

  private async getSalonId(): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    return user.id;
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const salonId = await this.getSalonId();
    const url = `${this.baseUrl}${endpoint}`;
    
    // Add salon_id to request body for POST requests
    let body = options.body;
    if (options.method === 'POST' && body) {
      const parsedBody = JSON.parse(body as string);
      parsedBody.salon_id = salonId;
      body = JSON.stringify(parsedBody);
    }
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'X-Salon-ID': salonId,
        ...options.headers,
      },
      ...options,
      body,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async getStatus(): Promise<{ session: WhatsAppServerSession }> {
    return this.makeRequest('/status');
  }

  async connect(): Promise<{ success: boolean; message: string }> {
    return this.makeRequest('/connect', { method: 'POST', body: JSON.stringify({}) });
  }

  async disconnect(): Promise<{ success: boolean; message: string }> {
    return this.makeRequest('/disconnect', { method: 'POST', body: JSON.stringify({}) });
  }

  async sendMessage(phone: string, message: string, appointmentId?: string): Promise<{ success: boolean; message_id: string }> {
    return this.makeRequest('/send', {
      method: 'POST',
      body: JSON.stringify({ phone, message, appointmentId }),
    });
  }

  async processQueue(): Promise<{ success: boolean; processed: number; failed: number }> {
    return this.makeRequest('/process-queue', { method: 'POST', body: JSON.stringify({}) });
  }

  async getQrCode(): Promise<{ qr_code: string | null }> {
    return this.makeRequest('/qr');
  }

  async checkHealth(): Promise<{ status: string; whatsapp_connected: boolean }> {
    return this.makeRequest('/health');
  }

  // Database methods (use Supabase for data persistence with proper salon_id)
  async getMessageHistory(): Promise<WhatsAppServerMessage[]> {
    try {
      const salonId = await this.getSalonId();
      const { data, error } = await supabase
        .from('whatsapp_messages')
        .select('*')
        .eq('salon_id', salonId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching message history:', error);
        return [];
      }

      return (data || []).map(msg => ({
        id: msg.id,
        recipient_phone: msg.recipient_phone,
        recipient_name: msg.recipient_name || undefined,
        message_content: msg.message_content,
        status: msg.status as WhatsAppServerMessage['status'],
        sent_at: msg.sent_at || undefined,
        error_message: msg.error_message || undefined
      }));
    } catch (error) {
      console.error('Error in getMessageHistory:', error);
      return [];
    }
  }

  // Real-time subscription for message updates
  subscribeToMessageUpdates(callback: (message: WhatsAppServerMessage) => void) {
    return supabase
      .channel('whatsapp-message-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'whatsapp_messages'
        },
        (payload) => {
          console.log('WhatsApp message update:', payload);
          if (payload.new) {
            const msg = payload.new as any;
            callback({
              id: msg.id,
              recipient_phone: msg.recipient_phone,
              recipient_name: msg.recipient_name || undefined,
              message_content: msg.message_content,
              status: msg.status,
              sent_at: msg.sent_at || undefined,
              error_message: msg.error_message || undefined
            });
          }
        }
      )
      .subscribe();
  }

  // Get automation settings for current salon
  async getAutomationSettings() {
    try {
      const salonId = await this.getSalonId();
      const { data, error } = await supabase
        .from('whatsapp_automation_settings')
        .select('*')
        .eq('salon_id', salonId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching automation settings:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getAutomationSettings:', error);
      return null;
    }
  }

  // Update automation settings for current salon
  async updateAutomationSettings(settings: any) {
    try {
      const salonId = await this.getSalonId();
      const { data, error } = await supabase
        .from('whatsapp_automation_settings')
        .upsert({
          salon_id: salonId,
          ...settings,
          updated_at: new Date().toISOString()
        }, { onConflict: 'salon_id' });

      if (error) {
        console.error('Error saving automation settings:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in updateAutomationSettings:', error);
      throw error;
    }
  }

  // Get reminder queue for current salon
  async getReminderQueue(status?: string) {
    try {
      const salonId = await this.getSalonId();
      let query = supabase
        .from('whatsapp_reminder_queue')
        .select('*')
        .eq('salon_id', salonId)
        .order('scheduled_time', { ascending: true });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching reminder queue:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getReminderQueue:', error);
      return [];
    }
  }
}

export const whatsappServerClient = new WhatsAppServerClient();
