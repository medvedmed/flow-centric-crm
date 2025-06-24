
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WhatsAppSession {
  id: string
  salon_id: string
  phone_number?: string
  is_connected: boolean
  connection_state: string
  qr_code?: string
  webjs_session_data?: any
  client_info?: any
  rate_limit_reset: string
  messages_sent_today: number
  last_activity: string
}

interface MessageQueueItem {
  id: string
  salon_id: string
  recipient_phone: string
  message_content: string
  message_type: string
  priority: number
  scheduled_for: string
  attempts: number
  max_attempts: number
  status: string
  appointment_id?: string
  reminder_type?: string
}

class WhatsAppWebJSService {
  private supabase: any
  private sessions: Map<string, any> = new Map()
  private messageQueues: Map<string, MessageQueueItem[]> = new Map()
  private rateLimits: Map<string, { count: number, resetTime: number }> = new Map()

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey)
  }

  async initializeSession(salonId: string): Promise<{ success: boolean, qrCode?: string, error?: string }> {
    try {
      console.log(`Initializing WhatsApp session for salon: ${salonId}`)
      
      // Check existing session
      const { data: existingSession } = await this.supabase
        .from('whatsapp_sessions')
        .select('*')
        .eq('salon_id', salonId)
        .single()

      if (existingSession?.is_connected) {
        return { success: true }
      }

      // Create new session entry
      const sessionData = {
        salon_id: salonId,
        connection_state: 'initializing',
        is_connected: false,
        webjs_session_data: {},
        client_info: {},
        rate_limit_reset: new Date().toISOString(),
        messages_sent_today: 0,
        last_activity: new Date().toISOString()
      }

      if (existingSession) {
        await this.supabase
          .from('whatsapp_sessions')
          .update(sessionData)
          .eq('salon_id', salonId)
      } else {
        await this.supabase
          .from('whatsapp_sessions')
          .insert(sessionData)
      }

      // Generate mock QR code for demo (in real implementation, this would come from WhatsApp Web.js)
      const mockQrCode = `whatsapp-qr-${salonId}-${Date.now()}`
      
      await this.supabase
        .from('whatsapp_sessions')
        .update({
          qr_code: mockQrCode,
          connection_state: 'qr_ready'
        })
        .eq('salon_id', salonId)

      this.logEvent(salonId, 'session_initialized', { qr_generated: true })

      return { success: true, qrCode: mockQrCode }
    } catch (error) {
      console.error('Error initializing session:', error)
      this.logEvent(salonId, 'session_error', { error: error.message }, 'error')
      return { success: false, error: error.message }
    }
  }

  async authenticateSession(salonId: string): Promise<{ success: boolean, error?: string }> {
    try {
      console.log(`Authenticating WhatsApp session for salon: ${salonId}`)
      
      // Simulate authentication process
      await new Promise(resolve => setTimeout(resolve, 2000))

      const clientInfo = {
        phone: `+1234567890${salonId.slice(-3)}`,
        name: `Salon ${salonId.slice(-4)}`,
        connected_at: new Date().toISOString()
      }

      await this.supabase
        .from('whatsapp_sessions')
        .update({
          is_connected: true,
          connection_state: 'authenticated',
          phone_number: clientInfo.phone,
          client_info: clientInfo,
          last_activity: new Date().toISOString(),
          qr_code: null
        })
        .eq('salon_id', salonId)

      this.logEvent(salonId, 'session_authenticated', clientInfo)

      return { success: true }
    } catch (error) {
      console.error('Error authenticating session:', error)
      this.logEvent(salonId, 'authentication_error', { error: error.message }, 'error')
      return { success: false, error: error.message }
    }
  }

  async sendMessage(salonId: string, recipientPhone: string, message: string, appointmentId?: string, reminderType?: string): Promise<{ success: boolean, messageId?: string, error?: string }> {
    try {
      // Check rate limits
      if (!this.checkRateLimit(salonId)) {
        return { success: false, error: 'Rate limit exceeded. Please wait before sending more messages.' }
      }

      // Check if session is connected
      const { data: session } = await this.supabase
        .from('whatsapp_sessions')
        .select('*')
        .eq('salon_id', salonId)
        .single()

      if (!session?.is_connected) {
        return { success: false, error: 'WhatsApp session not connected' }
      }

      // Add to message queue
      const messageId = crypto.randomUUID()
      const queueItem: MessageQueueItem = {
        id: messageId,
        salon_id: salonId,
        recipient_phone: recipientPhone,
        message_content: message,
        message_type: 'text',
        priority: reminderType === 'urgent' ? 1 : 2,
        scheduled_for: new Date().toISOString(),
        attempts: 0,
        max_attempts: 3,
        status: 'pending',
        appointment_id: appointmentId,
        reminder_type: reminderType
      }

      await this.supabase
        .from('whatsapp_message_queue')
        .insert(queueItem)

      // Process message with ban protection
      const result = await this.processMessageWithProtection(salonId, queueItem)

      return result
    } catch (error) {
      console.error('Error sending message:', error)
      this.logEvent(salonId, 'message_send_error', { error: error.message, recipient: recipientPhone }, 'error')
      return { success: false, error: error.message }
    }
  }

  private async processMessageWithProtection(salonId: string, message: MessageQueueItem): Promise<{ success: boolean, messageId?: string, error?: string }> {
    try {
      // Implement human-like delays
      const delay = Math.random() * 3000 + 2000 // 2-5 seconds delay
      await new Promise(resolve => setTimeout(resolve, delay))

      // Update rate limit counter
      await this.supabase
        .from('whatsapp_sessions')
        .update({
          messages_sent_today: this.supabase.raw('messages_sent_today + 1'),
          last_activity: new Date().toISOString()
        })
        .eq('salon_id', salonId)

      // Update message status to processing
      await this.supabase
        .from('whatsapp_message_queue')
        .update({
          status: 'processing',
          attempts: message.attempts + 1
        })
        .eq('id', message.id)

      // Simulate message sending (in real implementation, this would use WhatsApp Web.js)
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Update message status to sent
      await this.supabase
        .from('whatsapp_message_queue')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString()
        })
        .eq('id', message.id)

      // Store in whatsapp_messages table
      await this.supabase
        .from('whatsapp_messages')
        .insert({
          salon_id: salonId,
          recipient_phone: message.recipient_phone,
          message_content: message.message_content,
          message_type: message.message_type,
          appointment_id: message.appointment_id,
          reminder_id: message.reminder_type ? crypto.randomUUID() : null,
          status: 'sent',
          sent_at: new Date().toISOString(),
          whatsapp_message_id: `msg_${Date.now()}`
        })

      this.logEvent(salonId, 'message_sent', {
        recipient: message.recipient_phone,
        message_id: message.id,
        appointment_id: message.appointment_id
      })

      return { success: true, messageId: message.id }
    } catch (error) {
      console.error('Error processing message:', error)
      
      // Update message status to failed
      await this.supabase
        .from('whatsapp_message_queue')
        .update({
          status: 'failed',
          error_message: error.message
        })
        .eq('id', message.id)

      this.logEvent(salonId, 'message_failed', {
        message_id: message.id,
        error: error.message,
        recipient: message.recipient_phone
      }, 'error')

      return { success: false, error: error.message }
    }
  }

  private checkRateLimit(salonId: string): boolean {
    const now = Date.now()
    const rateLimit = this.rateLimits.get(salonId) || { count: 0, resetTime: now + 60000 }

    if (now > rateLimit.resetTime) {
      // Reset rate limit
      this.rateLimits.set(salonId, { count: 1, resetTime: now + 60000 })
      return true
    }

    if (rateLimit.count >= 10) { // Max 10 messages per minute
      return false
    }

    rateLimit.count++
    this.rateLimits.set(salonId, rateLimit)
    return true
  }

  async getSessionStatus(salonId: string): Promise<WhatsAppSession | null> {
    try {
      const { data } = await this.supabase
        .from('whatsapp_sessions')
        .select('*')
        .eq('salon_id', salonId)
        .single()

      return data
    } catch (error) {
      console.error('Error getting session status:', error)
      return null
    }
  }

  async getMessageQueue(salonId: string, status?: string): Promise<MessageQueueItem[]> {
    try {
      let query = this.supabase
        .from('whatsapp_message_queue')
        .select('*')
        .eq('salon_id', salonId)
        .order('scheduled_for', { ascending: true })

      if (status) {
        query = query.eq('status', status)
      }

      const { data } = await query
      return data || []
    } catch (error) {
      console.error('Error getting message queue:', error)
      return []
    }
  }

  private async logEvent(salonId: string, eventType: string, eventData: any, severity: string = 'info') {
    try {
      await this.supabase
        .from('whatsapp_session_logs')
        .insert({
          salon_id: salonId,
          event_type: eventType,
          event_data: eventData,
          severity: severity
        })
    } catch (error) {
      console.error('Error logging event:', error)
    }
  }

  async disconnectSession(salonId: string): Promise<{ success: boolean, error?: string }> {
    try {
      await this.supabase
        .from('whatsapp_sessions')
        .update({
          is_connected: false,
          connection_state: 'disconnected',
          last_activity: new Date().toISOString()
        })
        .eq('salon_id', salonId)

      this.sessions.delete(salonId)
      this.logEvent(salonId, 'session_disconnected', {})

      return { success: true }
    } catch (error) {
      console.error('Error disconnecting session:', error)
      return { success: false, error: error.message }
    }
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const whatsappService = new WhatsAppWebJSService(supabaseUrl, supabaseServiceKey)
    
    const { action, salonId, ...params } = await req.json()

    let result: any = { success: false, error: 'Unknown action' }

    switch (action) {
      case 'initialize':
        result = await whatsappService.initializeSession(salonId)
        break
        
      case 'authenticate':
        result = await whatsappService.authenticateSession(salonId)
        break
        
      case 'send_message':
        result = await whatsappService.sendMessage(
          salonId,
          params.recipientPhone,
          params.message,
          params.appointmentId,
          params.reminderType
        )
        break
        
      case 'get_status':
        const status = await whatsappService.getSessionStatus(salonId)
        result = { success: true, session: status }
        break
        
      case 'get_queue':
        const queue = await whatsappService.getMessageQueue(salonId, params.status)
        result = { success: true, queue }
        break
        
      case 'disconnect':
        result = await whatsappService.disconnectSession(salonId)
        break
        
      default:
        result = { success: false, error: `Unknown action: ${action}` }
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('WhatsApp Web.js Edge Function Error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
