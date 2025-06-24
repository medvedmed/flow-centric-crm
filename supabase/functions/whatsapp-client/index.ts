
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WhatsAppSession {
  id: string
  salon_id: string
  phone_number?: string
  connection_state: string
  is_connected: boolean
  verification_code?: string
  verification_expires_at?: string
  verification_attempts: number
  max_verification_attempts: number
  phone_verified: boolean
  business_account_id?: string
  access_token?: string
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
      case 'request-verification':
        const { phoneNumber } = await req.json()
        return await requestVerificationCode(supabaseClient, user.id, phoneNumber)
      
      case 'verify-code':
        const { phoneNumber: phone, code } = await req.json()
        return await verifyCode(supabaseClient, user.id, phone, code)
      
      case 'check-connection':
        return await checkConnection(supabaseClient, user.id)
      
      case 'send-message':
        const { phone: messagePhone, message, appointmentId } = await req.json()
        return await sendMessage(supabaseClient, user.id, messagePhone, message, appointmentId)
      
      case 'reset-session':
        return await resetSession(supabaseClient, user.id)
      
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

async function requestVerificationCode(supabase: any, userId: string, phoneNumber: string) {
  try {
    console.log('Requesting verification code for user:', userId, 'phone:', phoneNumber)
    
    // Clean up phone number
    const cleanPhone = phoneNumber.replace(/\D/g, '')
    const formattedPhone = cleanPhone.startsWith('1') ? `+${cleanPhone}` : `+1${cleanPhone}`
    
    // Generate a 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now
    
    // Check if session exists and update or create
    const { data: existingSession } = await supabase
      .from('whatsapp_sessions')
      .select('*')
      .eq('salon_id', userId)
      .single()

    if (existingSession) {
      // Check rate limiting
      if (existingSession.verification_attempts >= existingSession.max_verification_attempts) {
        throw new Error('Too many verification attempts. Please wait before trying again.')
      }

      // Update existing session
      const { error } = await supabase
        .from('whatsapp_sessions')
        .update({
          phone_number: formattedPhone,
          verification_code: verificationCode,
          verification_expires_at: expiresAt.toISOString(),
          verification_attempts: existingSession.verification_attempts + 1,
          connection_state: 'verification_pending',
          is_connected: false,
          phone_verified: false,
          updated_at: new Date().toISOString()
        })
        .eq('salon_id', userId)

      if (error) throw error
    } else {
      // Create new session
      const { error } = await supabase
        .from('whatsapp_sessions')
        .insert({
          salon_id: userId,
          phone_number: formattedPhone,
          verification_code: verificationCode,
          verification_expires_at: expiresAt.toISOString(),
          verification_attempts: 1,
          max_verification_attempts: 3,
          connection_state: 'verification_pending',
          is_connected: false,
          phone_verified: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (error) throw error
    }

    // In a real implementation, you would send the SMS/WhatsApp message here
    // For now, we'll simulate it by logging the code
    console.log(`Verification code for ${formattedPhone}: ${verificationCode}`)
    
    // TODO: Integrate with WhatsApp Business API to send actual verification message
    // await sendWhatsAppVerification(formattedPhone, verificationCode)

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Verification code sent successfully',
        // In development, include the code for testing
        ...(Deno.env.get('ENVIRONMENT') === 'development' && { code: verificationCode })
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  } catch (error) {
    console.error('Error in requestVerificationCode:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 400,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
}

async function verifyCode(supabase: any, userId: string, phoneNumber: string, code: string) {
  try {
    console.log('Verifying code for user:', userId, 'phone:', phoneNumber, 'code:', code)
    
    // Get the session
    const { data: session, error: sessionError } = await supabase
      .from('whatsapp_sessions')
      .select('*')
      .eq('salon_id', userId)
      .single()

    if (sessionError || !session) {
      throw new Error('No verification session found')
    }

    // Check if code has expired
    if (new Date() > new Date(session.verification_expires_at)) {
      throw new Error('Verification code has expired')
    }

    // Check if code matches
    if (session.verification_code !== code) {
      throw new Error('Invalid verification code')
    }

    // Verify the phone number and establish connection
    const { error } = await supabase
      .from('whatsapp_sessions')
      .update({
        phone_verified: true,
        is_connected: true,
        connection_state: 'connected',
        verification_code: null,
        verification_expires_at: null,
        verification_attempts: 0,
        last_connected_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('salon_id', userId)

    if (error) throw error

    console.log('Phone verification successful for:', phoneNumber)

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Phone number verified successfully'
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  } catch (error) {
    console.error('Error in verifyCode:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 400,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
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
      .maybeSingle()

    if (error) {
      console.error('Database error in checkConnection:', error)
      throw error
    }

    // If no session exists, return disconnected state
    if (!data) {
      return new Response(
        JSON.stringify({ 
          is_connected: false,
          connection_state: 'phone_required',
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

    return new Response(
      JSON.stringify({ 
        is_connected: data.is_connected && data.phone_verified,
        connection_state: data.connection_state,
        phone_number: data.phone_number,
        phone_verified: data.phone_verified,
        last_connected_at: data.last_connected_at
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
    // Check if WhatsApp is connected and verified
    const { data: session, error: sessionError } = await supabase
      .from('whatsapp_sessions')
      .select('is_connected, phone_verified, phone_number')
      .eq('salon_id', userId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (sessionError) {
      console.error('Error checking session:', sessionError)
      throw sessionError
    }

    if (!session?.is_connected || !session?.phone_verified) {
      throw new Error('WhatsApp not connected or phone not verified')
    }

    // Log the message attempt
    const { data: messageLog, error: logError } = await supabase
      .from('whatsapp_messages')
      .insert({
        salon_id: userId,
        recipient_phone: phone,
        message_content: message,
        status: 'sending',
        appointment_id: appointmentId,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (logError) {
      console.error('Error logging message:', logError)
      throw logError
    }

    // TODO: Integrate with WhatsApp Business API to send actual message
    // For now, simulate message sending
    const success = Math.random() > 0.05 //  95% success rate
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    if (success) {
      await supabase
        .from('whatsapp_messages')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString(),
          whatsapp_message_id: messageId,
          updated_at: new Date().toISOString()
        })
        .eq('id', messageLog.id)

      // Simulate delivery after a short delay
      setTimeout(async () => {
        await supabase
          .from('whatsapp_messages')
          .update({
            status: 'delivered',
            delivered_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', messageLog.id)
      }, 2000)

      return new Response(
        JSON.stringify({ 
          success: true, 
          message_id: messageLog.id,
          whatsapp_message_id: messageId,
          status: 'sent'
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
          error_message: 'Failed to send message - network error',
          updated_at: new Date().toISOString()
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
        phone_verified: false,
        verification_code: null,
        verification_expires_at: null,
        verification_attempts: 0,
        updated_at: new Date().toISOString()
      })
      .eq('salon_id', userId)

    if (error) {
      console.error('Error disconnecting:', error)
      throw error
    }

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

async function resetSession(supabase: any, userId: string) {
  try {
    console.log('Resetting WhatsApp session for user:', userId)
    
    // Delete existing sessions to start fresh
    await supabase
      .from('whatsapp_sessions')
      .delete()
      .eq('salon_id', userId)
    
    console.log('WhatsApp session reset successfully')

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
    console.error('Error in resetSession:', error)
    throw new Error(`Failed to reset WhatsApp session: ${error.message}`)
  }
}
