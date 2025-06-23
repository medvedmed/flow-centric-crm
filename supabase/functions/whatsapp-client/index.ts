
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WhatsAppSession {
  id: string
  salon_id: string
  session_data: any
  qr_code?: string
  connection_state: string
  phone_number?: string
  is_connected: boolean
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
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
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const url = new URL(req.url)
    const action = url.searchParams.get('action')

    switch (action) {
      case 'init-session':
        return await initWhatsAppSession(supabaseClient, user.id)
      
      case 'get-qr':
        return await getQRCode(supabaseClient, user.id)
      
      case 'check-connection':
        return await checkConnection(supabaseClient, user.id)
      
      case 'send-message':
        const { phone, message, appointmentId } = await req.json()
        return await sendMessage(supabaseClient, user.id, phone, message, appointmentId)
      
      case 'disconnect':
        return await disconnectSession(supabaseClient, user.id)
      
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
  } catch (error) {
    console.error('WhatsApp Client Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function initWhatsAppSession(supabase: any, userId: string) {
  try {
    // Generate a unique QR code for this session
    const qrCode = generateQRCode(userId)
    
    // Create or update WhatsApp session - use ORDER BY and LIMIT to get the most recent one
    const { data, error } = await supabase
      .from('whatsapp_sessions')
      .upsert({
        salon_id: userId,
        qr_code: qrCode,
        connection_state: 'waiting_for_scan',
        is_connected: false,
        session_data: { initialized_at: new Date().toISOString() },
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'salon_id'
      })
      .select()
      .order('updated_at', { ascending: false })
      .limit(1)
      .single()

    if (error) {
      console.error('Database error in initWhatsAppSession:', error)
      throw error
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        qr_code: qrCode,
        session_id: data.id 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  } catch (error) {
    console.error('Error in initWhatsAppSession:', error)
    throw new Error(`Failed to initialize WhatsApp session: ${error.message}`)
  }
}

async function getQRCode(supabase: any, userId: string) {
  try {
    const { data, error } = await supabase
      .from('whatsapp_sessions')
      .select('qr_code, connection_state')
      .eq('salon_id', userId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Database error in getQRCode:', error)
      throw error
    }

    return new Response(
      JSON.stringify({ 
        qr_code: data?.qr_code,
        connection_state: data?.connection_state || 'disconnected'
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  } catch (error) {
    console.error('Error in getQRCode:', error)
    throw new Error(`Failed to get QR code: ${error.message}`)
  }
}

async function checkConnection(supabase: any, userId: string) {
  try {
    const { data, error } = await supabase
      .from('whatsapp_sessions')
      .select('*')
      .eq('salon_id', userId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Database error in checkConnection:', error)
      throw error
    }

    // If no session exists, return disconnected state
    if (!data) {
      return new Response(
        JSON.stringify({ 
          is_connected: false,
          connection_state: 'disconnected',
          phone_number: null
        }),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      )
    }

    // Simulate connection check - in real implementation, this would check actual WhatsApp Web connection
    let connectionState = data.connection_state || 'disconnected'
    let isConnected = data.is_connected || false
    let phoneNumber = data.phone_number

    // Mock connection establishment after QR scan (30% chance when waiting for scan)
    if (connectionState === 'waiting_for_scan' && Math.random() > 0.7) {
      connectionState = 'connected'
      isConnected = true
      phoneNumber = '+1234567890' // This would come from actual WhatsApp session
      
      // Update the session
      await supabase
        .from('whatsapp_sessions')
        .update({
          connection_state: connectionState,
          is_connected: isConnected,
          phone_number: phoneNumber,
          last_connected_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('salon_id', userId)
    }

    return new Response(
      JSON.stringify({ 
        is_connected: isConnected,
        connection_state: connectionState,
        phone_number: phoneNumber
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  } catch (error) {
    console.error('Error in checkConnection:', error)
    throw new Error(`Failed to check connection: ${error.message}`)
  }
}

async function sendMessage(supabase: any, userId: string, phone: string, message: string, appointmentId?: string) {
  try {
    // Check if WhatsApp is connected
    const { data: session } = await supabase
      .from('whatsapp_sessions')
      .select('is_connected, phone_number')
      .eq('salon_id', userId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single()

    if (!session?.is_connected) {
      throw new Error('WhatsApp not connected')
    }

    // Log the message attempt
    const { data: messageLog, error: logError } = await supabase
      .from('whatsapp_messages')
      .insert({
        salon_id: userId,
        recipient_phone: phone,
        message_content: message,
        status: 'sending',
        appointment_id: appointmentId
      })
      .select()
      .single()

    if (logError) throw logError

    // In real implementation, this would send via WhatsApp Web API
    // For now, we'll simulate successful sending
    const success = Math.random() > 0.1 // 90% success rate

    if (success) {
      await supabase
        .from('whatsapp_messages')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString(),
          whatsapp_message_id: `msg_${Date.now()}`
        })
        .eq('id', messageLog.id)

      return new Response(
        JSON.stringify({ 
          success: true, 
          message_id: messageLog.id,
          whatsapp_message_id: `msg_${Date.now()}`
        }),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      )
    } else {
      await supabase
        .from('whatsapp_messages')
        .update({
          status: 'failed',
          error_message: 'Failed to send message'
        })
        .eq('id', messageLog.id)

      throw new Error('Failed to send WhatsApp message')
    }
  } catch (error) {
    console.error('Error in sendMessage:', error)
    throw new Error(`Send message failed: ${error.message}`)
  }
}

async function disconnectSession(supabase: any, userId: string) {
  try {
    const { error } = await supabase
      .from('whatsapp_sessions')
      .update({
        is_connected: false,
        connection_state: 'disconnected',
        qr_code: null,
        phone_number: null,
        session_data: null,
        updated_at: new Date().toISOString()
      })
      .eq('salon_id', userId)

    if (error) throw error

    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  } catch (error) {
    console.error('Error in disconnectSession:', error)
    throw new Error(`Failed to disconnect: ${error.message}`)
  }
}

function generateQRCode(userId: string): string {
  // In real implementation, this would generate actual WhatsApp Web QR code
  // For now, we'll create a mock QR code data
  const timestamp = Date.now()
  const sessionId = `${userId}_${timestamp}`
  return `whatsapp://connect?session=${sessionId}&timestamp=${timestamp}`
}
