
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
    // Generate a realistic QR code using SVG
    const qrCodeSvg = generateRealisticQRCode(salonId);
    
    // Simulate WhatsApp Web connection initialization with enhanced features
    const sessionData = {
      salon_id: salonId,
      connection_state: 'connecting',
      is_connected: false,
      qr_code: btoa(qrCodeSvg),
      webjs_session_data: {
        initialized: true,
        timestamp: new Date().toISOString(),
        features: ['auto_reminders', 'message_queue', 'template_support', 'delivery_tracking']
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
          features_enabled: ['automation', 'templates', 'queue_processing', 'real_qr_generation']
        },
        severity: 'info'
      })

    // Simulate enhanced connection after 10 seconds (user has time to scan)
    setTimeout(async () => {
      try {
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
                name: 'WhatsApp Web Enhanced',
                version: '2.2408.10',
                platform: 'web',
                enhanced_features: true
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
              features_active: true,
              enhanced_mode: true
            },
            severity: 'info'
          })

        // Initialize automation settings if not exists
        await supabaseClient
          .from('whatsapp_automation_settings')
          .upsert({
            salon_id: salonId,
            is_enabled: true,
            reminder_24h_enabled: true,
            reminder_2h_enabled: false,
            reminder_1h_enabled: false
          }, { onConflict: 'salon_id' })
      } catch (error) {
        console.error('Error in delayed connection setup:', error);
      }
    }, 10000)

    return new Response(
      JSON.stringify({ success: true, session }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Enhanced connect error:', error)
    throw error
  }
}

function generateRealisticQRCode(salonId: string): string {
  // Generate a more realistic QR code SVG with proper structure
  const size = 256;
  const moduleSize = 8;
  const modules = size / moduleSize;
  
  // Create a pattern that looks like a real QR code
  const pattern = [];
  for (let i = 0; i < modules; i++) {
    pattern[i] = [];
    for (let j = 0; j < modules; j++) {
      // Create finder patterns in corners
      if ((i < 7 && j < 7) || (i < 7 && j >= modules - 7) || (i >= modules - 7 && j < 7)) {
        pattern[i][j] = (i === 0 || i === 6 || j === 0 || j === 6 || (i >= 2 && i <= 4 && j >= 2 && j <= 4));
      } else {
        // Random pattern based on salon ID for uniqueness
        const hash = salonId.charCodeAt((i * modules + j) % salonId.length);
        pattern[i][j] = (hash + i + j) % 3 === 0;
      }
    }
  }

  let svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${size}" height="${size}" fill="white"/>`;

  for (let i = 0; i < modules; i++) {
    for (let j = 0; j < modules; j++) {
      if (pattern[i][j]) {
        svg += `<rect x="${j * moduleSize}" y="${i * moduleSize}" width="${moduleSize}" height="${moduleSize}" fill="black"/>`;
      }
    }
  }

  svg += `
    <circle cx="${size/2}" cy="${size/2}" r="20" fill="white" stroke="black" stroke-width="2"/>
    <circle cx="${size/2}" cy="${size/2}" r="8" fill="green"/>
    <text x="${size/2}" y="${size/2 + 4}" text-anchor="middle" font-family="Arial" font-size="8" fill="white">✓</text>
    <text x="${size/2}" y="${size - 10}" text-anchor="middle" font-family="Arial" font-size="12" fill="green" font-weight="bold">Enhanced WhatsApp</text>
  </svg>`;

  return svg;
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
      const success = Math.random() > 0.02 // 98% success rate for enhanced version

      try {
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
            messages_sent_today: (session.messages_sent_today || 0) + 1
          })
          .eq('salon_id', salonId)
      } catch (error) {
        console.error('Error updating message status:', error);
      }
    }, 1000)

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
        attempts: (reminder.attempts || 0) + 1
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
        attempts: (reminder?.attempts || 0) + 1
      })
      .eq('id', reminderId)

    throw error
  }
}

async function handleProcessQueue(supabaseClient: any, salonId: string) {
  try {
    // Get pending reminders for this salon
    const { data: pendingReminders, error } = await supabaseClient
      .from('whatsapp_reminder_queue')
      .select('*')
      .eq('salon_id', salonId)
      .eq('status', 'pending')
      .lte('scheduled_time', new Date().toISOString())
      .limit(5)

    if (error) throw error

    const processed = []

    for (const reminder of pendingReminders || []) {
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
