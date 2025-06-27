
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
    // Use your WhatsApp server URL
    this.baseUrl = 'http://localhost:3020';
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
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
    return this.makeRequest('/connect', { method: 'POST' });
  }

  async disconnect(): Promise<{ success: boolean; message: string }> {
    return this.makeRequest('/disconnect', { method: 'POST' });
  }

  async sendMessage(phone: string, message: string, appointmentId?: string): Promise<{ success: boolean; message_id: string }> {
    return this.makeRequest('/send', {
      method: 'POST',
      body: JSON.stringify({ phone, message, appointmentId }),
    });
  }

  async processQueue(): Promise<{ success: boolean; processed: number; failed: number }> {
    return this.makeRequest('/process-queue', { method: 'POST' });
  }

  async getQrCode(): Promise<{ qr_code: string | null }> {
    return this.makeRequest('/qr');
  }

  async checkHealth(): Promise<{ status: string; whatsapp_connected: boolean }> {
    return this.makeRequest('/health');
  }

  // Database methods (still use Supabase for data persistence)
  async getMessageHistory(): Promise<WhatsAppServerMessage[]> {
    try {
      const { data, error } = await supabase
        .from('whatsapp_messages')
        .select('*')
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
}

export const whatsappServerClient = new WhatsAppServerClient();
