
import { supabase } from '@/integrations/supabase/client';

export interface WhatsAppSessionData {
  id: string;
  salon_id: string;
  phone_number?: string;
  is_connected: boolean;
  connection_state: 'phone_required' | 'verification_pending' | 'connected' | 'disconnected' | 'error';
  verification_code?: string;
  verification_expires_at?: string;
  verification_attempts: number;
  max_verification_attempts: number;
  phone_verified: boolean;
  business_account_id?: string;
  access_token?: string;
  last_connected_at?: string;
  last_seen?: string;
}

export interface WhatsAppMessage {
  id: string;
  recipient_phone: string;
  recipient_name?: string;
  message_content: string;
  status: 'pending' | 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  sent_at?: string;
  error_message?: string;
  appointment_id?: string;
}

class WhatsAppClientService {
  private baseUrl: string;

  constructor() {
    // Use the correct Supabase URL
    this.baseUrl = `https://mqojlcooxwmdrygmoczi.supabase.co/functions/v1/whatsapp-client`;
  }

  private async makeRequest(action: string, data?: any) {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error('Authentication required');
    }

    const url = `${this.baseUrl}?action=${action}`;
    const response = await fetch(url, {
      method: data ? 'POST' : 'GET',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  async requestVerificationCode(phoneNumber: string): Promise<{ success: boolean; error?: string }> {
    console.log('Requesting verification code for:', phoneNumber);
    return this.makeRequest('request-verification', { phoneNumber });
  }

  async verifyCode(phoneNumber: string, code: string): Promise<{ success: boolean; error?: string }> {
    console.log('Verifying code for:', phoneNumber);
    return this.makeRequest('verify-code', { phoneNumber, code });
  }

  async checkConnection(): Promise<{ is_connected: boolean; connection_state: string; phone_number?: string }> {
    return this.makeRequest('check-connection');
  }

  async sendMessage(phone: string, message: string, appointmentId?: string): Promise<{ success: boolean; message_id: string }> {
    console.log('Sending WhatsApp message to:', phone);
    return this.makeRequest('send-message', { phone, message, appointmentId });
  }

  async disconnect(): Promise<{ success: boolean }> {
    console.log('Disconnecting WhatsApp session...');
    return this.makeRequest('disconnect');
  }

  async resetSession(): Promise<{ success: boolean }> {
    console.log('Resetting WhatsApp session...');
    return this.makeRequest('reset-session');
  }

  async getSession(): Promise<WhatsAppSessionData | null> {
    try {
      const { data, error } = await supabase
        .from('whatsapp_sessions')
        .select('*')
        .eq('salon_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (error) {
        console.error('Error fetching WhatsApp session:', error);
        return null;
      }

      return data as WhatsAppSessionData;
    } catch (error) {
      console.error('Error in getSession:', error);
      return null;
    }
  }

  async getMessageHistory(): Promise<WhatsAppMessage[]> {
    try {
      const { data, error } = await supabase
        .from('whatsapp_messages')
        .select('*')
        .eq('salon_id', (await supabase.auth.getUser()).data.user?.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching message history:', error);
        return [];
      }

      return data as WhatsAppMessage[];
    } catch (error) {
      console.error('Error in getMessageHistory:', error);
      return [];
    }
  }

  // Real-time subscription for session updates
  subscribeToSessionUpdates(callback: (session: WhatsAppSessionData) => void) {
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
          console.log('WhatsApp session update:', payload);
          callback(payload.new as WhatsAppSessionData);
        }
      )
      .subscribe();
  }

  // Real-time subscription for message updates
  subscribeToMessageUpdates(callback: (message: WhatsAppMessage) => void) {
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
          callback(payload.new as WhatsAppMessage);
        }
      )
      .subscribe();
  }
}

export const whatsappClient = new WhatsAppClientService();
