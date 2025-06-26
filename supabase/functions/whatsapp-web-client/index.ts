
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// In-memory storage for WhatsApp clients (in production, use Redis or similar)
const clients = new Map();

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

    const { action, phone, message } = await req.json()
    console.log('WhatsApp Web Client Action:', action, { phone, message: message?.substring(0, 50) })

    switch (action) {
      case 'connect':
        return await handleConnect(supabaseClient, user.id)
      case 'disconnect':
        return await handleDisconnect(supabaseClient, user.id)
      case 'send_message':
        return await handleSendMessage(supabaseClient, user.id, phone, message)
      case 'get_status':
        return await handleGetStatus(supabaseClient, user.id)
      default:
        throw new Error('Invalid action')
    }
  } catch (error) {
    console.error('WhatsApp Web Client Error:', error)
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
    // Simulate WhatsApp Web connection initialization
    const sessionData = {
      salon_id: salonId,
      connection_state: 'connecting',
      is_connected: false,
      qr_code: generateMockQRCode(), // In real implementation, this would be from whatsapp-web.js
      webjs_session_data: {},
      last_activity: new Date().toISOString()
    }

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
        event_type: 'connection_initiated',
        event_data: { timestamp: new Date().toISOString() },
        severity: 'info'
      })

    // Simulate QR code timeout and mock connection after 10 seconds
    setTimeout(async () => {
      await supabaseClient
        .from('whatsapp_sessions')
        .update({
          connection_state: 'connected',
          is_connected: true,
          phone_number: '+1234567890', // Mock phone number
          qr_code: null,
          last_connected_at: new Date().toISOString()
        })
        .eq('salon_id', salonId)

      await supabaseClient
        .from('whatsapp_session_logs')
        .insert({
          salon_id: salonId,
          event_type: 'connection_established',
          event_data: { phone_number: '+1234567890' },
          severity: 'info'
        })
    }, 10000)

    return new Response(
      JSON.stringify({ success: true, session }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Connect error:', error)
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
        event_type: 'disconnection',
        event_data: { timestamp: new Date().toISOString() },
        severity: 'info'
      })

    // Remove from memory
    clients.delete(salonId)

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Disconnect error:', error)
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

    // Create message record
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

    // Simulate message sending (in real implementation, use whatsapp-web.js)
    setTimeout(async () => {
      const success = Math.random() > 0.1 // 90% success rate for demo

      await supabaseClient
        .from('whatsapp_messages')
        .update({
          status: success ? 'sent' : 'failed',
          sent_at: success ? new Date().toISOString() : null,
          error_message: success ? null : 'Failed to send message',
          whatsapp_message_id: success ? `msg_${Date.now()}` : null
        })
        .eq('id', messageRecord.id)

      // Update session activity
      await supabaseClient
        .from('whatsapp_sessions')
        .update({
          last_activity: new Date().toISOString(),
          messages_sent_today: session.messages_sent_today + 1
        })
        .eq('salon_id', salonId)
    }, 2000)

    return new Response(
      JSON.stringify({ success: true, message_id: messageRecord.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Send message error:', error)
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

    return new Response(
      JSON.stringify({ session }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Get status error:', error)
    throw error
  }
}

function generateMockQRCode(): string {
  // Generate a simple base64 QR code placeholder
  // In real implementation, this would come from whatsapp-web.js
  const canvas = `
    <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="200" fill="white"/>
      <rect x="20" y="20" width="160" height="160" fill="black" stroke="white" stroke-width="2"/>
      <rect x="40" y="40" width="120" height="120" fill="white"/>
      <text x="100" y="100" text-anchor="middle" font-family="Arial" font-size="12" fill="black">
        QR Code
      </text>
      <text x="100" y="120" text-anchor="middle" font-family="Arial" font-size="8" fill="black">
        (Mock)
      </text>
    </svg>
  `
  return btoa(canvas)
}
