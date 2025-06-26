
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// In-memory storage for WhatsApp clients (in production, use Redis or similar)
const clients = new Map();
const qrCodes = new Map();

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) {
      throw new Error('User not authenticated')
    }

    const { action, phone, message, reminder_id } = await req.json()
    console.log('WhatsApp Enhanced Action:', action, { phone, message: message?.substring(0, 50), reminder_id })

    switch (action) {
      case 'connect':
        return await handleConnect(supabaseClient, user.id)
      case 'disconnect':
        return await handleDisconnect(supabaseClient, user.id)
      case 'send_message':
        return await handleSendMessage(supabaseClient, user.id, phone, message)
      case 'send_reminder':
        return await handleSendReminder(supabaseClient, user.id, reminder_id)
      case 'process_queue':
        return await handleProcessQueue(supabaseClient, user.id)
      case 'get_status':
        return await handleGetStatus(supabaseClient, user.id)
      default:
        throw new Error('Invalid action')
    }
  } catch (error) {
    console.error('WhatsApp Enhanced Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

async function handleConnect(supabaseClient: any, salonId: string) {
  try {
    // Simulate WhatsApp Web connection initialization with enhanced features
    const sessionData = {
      salon_id: salonId,
      connection_state: 'connecting',
      is_connected: false,
      qr_code: generateEnhancedQRCode(),
      webjs_session_data: {
        initialized: true,
        timestamp: new Date().toISOString(),
        features: ['auto_reminders', 'message_queue', 'template_support']
      },
      last_activity: new Date().toISOString()
    }

    // Store QR code for this salon
    qrCodes.set(salonId, sessionData.qr_code);

    // Upsert session data
    const { data: session, error } = await supabaseClient
      .from('whatsapp_sessions')
      .upsert(sessionData, { onConflict: 'salon_id' })
      .select()
      .single()

    if (error) throw error

    // Log the connection attempt
    await supabaseClient
      .from('whatsapp_session_logs')
      .insert({
        salon_id: salonId,
        event_type: 'enhanced_connection_initiated',
        event_data: { 
          timestamp: new Date().toISOString(),
          features_enabled: ['automation', 'templates', 'queue_processing']
        },
        severity: 'info'
      })

    // Simulate enhanced connection after 8 seconds
    setTimeout(async () => {
      await supabaseClient
        .from('whatsapp_sessions')
        .update({
          connection_state: 'connected',
          is_connected: true,
          phone_number: '+1234567890', // Mock phone number
          qr_code: null,
          last_connected_at: new Date().toISOString(),
          webjs_session_data: {
            connected: true,
            device_info: {
              name: 'WhatsApp Web',
              version: '2.2408.10',
              platform: 'web'
            }
          }
        })
        .eq('salon_id', salonId)

      await supabaseClient
        .from('whatsapp_session_logs')
        .insert({
          salon_id: salonId,
          event_type: 'enhanced_connection_established',
          event_data: { 
            phone_number: '+1234567890',
            features_active: true
          },
          severity: 'info'
        })

      // Initialize automation settings if not exists
      await supabaseClient
        .from('whatsapp_automation_settings')
        .upsert({
          salon_id: salonId,
          is_enabled: true
        }, { onConflict: 'salon_id' })
    }, 8000)

    return new Response(
      JSON.stringify({ success: true, session }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Enhanced connect error:', error)
    throw error
  }
}

async function handleSendMessage(supabaseClient: any, salonId: string, phone: string, message: string) {
  try {
    // Check if session is connected
    const { data: session } = await supabaseClient
      .from('whatsapp_sessions')
      .select('*')
      .eq('salon_id', salonId)
      .single()

    if (!session?.is_connected) {
      throw new Error('WhatsApp session not connected')
    }

    // Create message record with enhanced tracking
    const messageData = {
      salon_id: salonId,
      recipient_phone: phone,
      message_content: message,
      message_type: 'text',
      status: 'pending'
    }

    const { data: messageRecord, error: messageError } = await supabaseClient
      .from('whatsapp_messages')
      .insert(messageData)
      .select()
      .single()

    if (messageError) throw messageError

    // Simulate enhanced message sending with better success rate
    setTimeout(async () => {
      const success = Math.random() > 0.05 // 95% success rate for enhanced version

      await supabaseClient
        .from('whatsapp_messages')
        .update({
          status: success ? 'sent' : 'failed',
          sent_at: success ? new Date().toISOString() : null,
          error_message: success ? null : 'Enhanced delivery failed - network error',
          whatsapp_message_id: success ? `enhanced_msg_${Date.now()}` : null
        })
        .eq('id', messageRecord.id)

      // Update session activity and message count
      await supabaseClient
        .from('whatsapp_sessions')
        .update({
          last_activity: new Date().toISOString(),
          messages_sent_today: session.messages_sent_today + 1
        })
        .eq('salon_id', salonId)
    }, 1500)

    return new Response(
      JSON.stringify({ success: true, message_id: messageRecord.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Enhanced send message error:', error)
    throw error
  }
}

async function handleSendReminder(supabaseClient: any, salonId: string, reminderId: string) {
  try {
    // Get reminder details
    const { data: reminder, error: reminderError } = await supabaseClient
      .from('whatsapp_reminder_queue')
      .select('*')
      .eq('id', reminderId)
      .eq('salon_id', salonId)
      .single()

    if (reminderError) throw reminderError
    if (!reminder) throw new Error('Reminder not found')

    // Send the reminder message
    const result = await handleSendMessage(
      supabaseClient, 
      salonId, 
      reminder.client_phone, 
      reminder.message_content
    )

    // Update reminder status
    await supabaseClient
      .from('whatsapp_reminder_queue')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString(),
        attempts: reminder.attempts + 1
      })
      .eq('id', reminderId)

    return result
  } catch (error) {
    console.error('Send reminder error:', error)
    
    // Update reminder status to failed
    await supabaseClient
      .from('whatsapp_reminder_queue')
      .update({
        status: 'failed',
        error_message: error.message,
        attempts: reminder.attempts + 1
      })
      .eq('id', reminderId)

    throw error
  }
}

async function handleProcessQueue(supabaseClient: any, salonId: string) {
  try {
    // Get pending reminders for this salon
    const { data: pendingReminders, error } = await supabaseClient
      .rpc('get_pending_whatsapp_reminders')

    if (error) throw error

    const salonReminders = pendingReminders?.filter(r => r.salon_id === salonId) || []
    const processed = []

    for (const reminder of salonReminders.slice(0, 5)) { // Process max 5 at a time
      try {
        await handleSendReminder(supabaseClient, salonId, reminder.id)
        processed.push({ id: reminder.id, status: 'sent' })
      } catch (error) {
        processed.push({ id: reminder.id, status: 'failed', error: error.message })
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed_count: processed.length,
        results: processed 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Process queue error:', error)
    throw error
  }
}

async function handleDisconnect(supabaseClient: any, salonId: string) {
  try {
    // Update session to disconnected state
    const { error } = await supabaseClient
      .from('whatsapp_sessions')
      .update({
        connection_state: 'disconnected',
        is_connected: false,
        qr_code: null,
        last_activity: new Date().toISOString()
      })
      .eq('salon_id', salonId)

    if (error) throw error

    // Log disconnection
    await supabaseClient
      .from('whatsapp_session_logs')
      .insert({
        salon_id: salonId,
        event_type: 'enhanced_disconnection',
        event_data: { timestamp: new Date().toISOString() },
        severity: 'info'
      })

    // Remove from memory
    clients.delete(salonId)
    qrCodes.delete(salonId)

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Enhanced disconnect error:', error)
    throw error
  }
}

async function handleGetStatus(supabaseClient: any, salonId: string) {
  try {
    const { data: session } = await supabaseClient
      .from('whatsapp_sessions')
      .select('*')
      .eq('salon_id', salonId)
      .single()

    const { data: automationSettings } = await supabaseClient
      .from('whatsapp_automation_settings')
      .select('*')
      .eq('salon_id', salonId)
      .single()

    const { data: queueCount } = await supabaseClient
      .from('whatsapp_reminder_queue')
      .select('id', { count: 'exact' })
      .eq('salon_id', salonId)
      .eq('status', 'pending')

    return new Response(
      JSON.stringify({ 
        session,
        automation_settings: automationSettings,
        pending_reminders: queueCount?.length || 0
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Get status error:', error)
    throw error
  }
}

function generateEnhancedQRCode(): string {
  // Generate a more realistic QR code placeholder for enhanced version
  const canvas = `
    <svg width="256" height="256" xmlns="http://www.w3.org/2000/svg">
      <rect width="256" height="256" fill="white"/>
      <rect x="16" y="16" width="224" height="224" fill="black" stroke="white" stroke-width="1"/>
      <rect x="32" y="32" width="192" height="192" fill="white"/>
      
      <!-- QR Code pattern simulation -->
      <rect x="40" y="40" width="24" height="24" fill="black"/>
      <rect x="40" y="192" width="24" height="24" fill="black"/>
      <rect x="192" y="40" width="24" height="24" fill="black"/>
      
      <!-- Enhanced features indicator -->
      <circle cx="128" cy="128" r="16" fill="green"/>
      <text x="128" y="134" text-anchor="middle" font-family="Arial" font-size="8" fill="white">✓</text>
      
      <text x="128" y="160" text-anchor="middle" font-family="Arial" font-size="10" fill="black">Enhanced</text>
      <text x="128" y="175" text-anchor="middle" font-family="Arial" font-size="8" fill="gray">WhatsApp Web JS</text>
    </svg>
  `
  return btoa(canvas)
}
