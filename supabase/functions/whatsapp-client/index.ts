
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

async function initWhatsAppSession(supabase: any, userId: string) {
  try {
    console.log('Initializing WhatsApp session for user:', userId)
    
    // Clean up any existing sessions for this user to avoid duplicates
    await supabase
      .from('whatsapp_sessions')
      .delete()
      .eq('salon_id', userId)
    
    // Generate a realistic QR code data
    const qrCode = generateRealisticQRCode(userId)
    const qrImageData = generateQRImageData(qrCode)
    
    // Create new WhatsApp session
    const { data, error } = await supabase
      .from('whatsapp_sessions')
      .insert({
        salon_id: userId,
        qr_code: qrCode,
        connection_state: 'waiting_for_scan',
        is_connected: false,
        session_data: { 
          initialized_at: new Date().toISOString(),
          qr_expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString() // 5 minutes
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Database error in initWhatsAppSession:', error)
      throw error
    }

    console.log('WhatsApp session initialized successfully:', data.id)

    return new Response(
      JSON.stringify({ 
        success: true, 
        qr_code: qrCode,
        qr_image_data: qrImageData,
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
      .select('qr_code, connection_state, session_data')
      .eq('salon_id', userId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) {
      console.error('Database error in getQRCode:', error)
      throw error
    }

    // Check if QR code has expired
    if (data?.session_data?.qr_expires_at) {
      const expiresAt = new Date(data.session_data.qr_expires_at)
      if (new Date() > expiresAt) {
        // QR code expired, generate a new one
        const newQrCode = generateRealisticQRCode(userId)
        await supabase
          .from('whatsapp_sessions')
          .update({
            qr_code: newQrCode,
            session_data: {
              ...data.session_data,
              qr_expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString()
            },
            updated_at: new Date().toISOString()
          })
          .eq('salon_id', userId)
        
        return new Response(
          JSON.stringify({ 
            qr_code: newQrCode,
            qr_image_data: generateQRImageData(newQrCode),
            connection_state: data?.connection_state || 'disconnected'
          }),
          { 
            headers: { 
              ...corsHeaders, 
              'Content-Type': 'application/json' 
            } 
          }
        )
      }
    }

    return new Response(
      JSON.stringify({ 
        qr_code: data?.qr_code,
        qr_image_data: data?.qr_code ? generateQRImageData(data.qr_code) : null,
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

    // Enhanced connection simulation - more realistic behavior
    let connectionState = data.connection_state || 'disconnected'
    let isConnected = data.is_connected || false
    let phoneNumber = data.phone_number

    // Simulate connection process with better logic
    if (connectionState === 'waiting_for_scan') {
      // Check if QR code has expired
      const qrExpiresAt = data.session_data?.qr_expires_at
      if (qrExpiresAt && new Date() > new Date(qrExpiresAt)) {
        connectionState = 'qr_expired'
      } else {
        // Random chance of connection (simulate user scanning)
        const connectionChance = Math.random()
        if (connectionChance > 0.85) { // 15% chance per check
          connectionState = 'connected'
          isConnected = true
          phoneNumber = '+1234567890' // This would be the actual phone number from WhatsApp
          
          // Update the session
          await supabase
            .from('whatsapp_sessions')
            .update({
              connection_state: connectionState,
              is_connected: isConnected,
              phone_number: phoneNumber,
              last_connected_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              session_data: {
                ...data.session_data,
                connected_at: new Date().toISOString()
              }
            })
            .eq('salon_id', userId)
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        is_connected: isConnected,
        connection_state: connectionState,
        phone_number: phoneNumber,
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
    // Check if WhatsApp is connected
    const { data: session, error: sessionError } = await supabase
      .from('whatsapp_sessions')
      .select('is_connected, phone_number')
      .eq('salon_id', userId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (sessionError) {
      console.error('Error checking session:', sessionError)
      throw sessionError
    }

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
        appointment_id: appointmentId,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (logError) {
      console.error('Error logging message:', logError)
      throw logError
    }

    // Enhanced message sending simulation
    const success = Math.random() > 0.05 // 95% success rate
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
        qr_code: null,
        phone_number: null,
        session_data: null,
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

function generateRealisticQRCode(userId: string): string {
  // Generate a more realistic WhatsApp Web QR code format
  const timestamp = Date.now()
  const randomBytes = crypto.getRandomValues(new Uint8Array(16))
  const randomString = Array.from(randomBytes, byte => byte.toString(16).padStart(2, '0')).join('')
  
  return `1@${randomString},${timestamp},${userId.substring(0, 8)},WhatsAppCRM`
}

function generateQRImageData(qrText: string): string {
  // Generate a more realistic QR code representation as SVG data URI
  const size = 256
  const cellSize = Math.floor(size / 33) // 33x33 grid for better resolution
  
  // Create a hash from the QR text for pattern generation
  let hash = 0
  for (let i = 0; i < qrText.length; i++) {
    hash = ((hash << 5) - hash + qrText.charCodeAt(i)) & 0xffffffff
  }
  
  let svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg" style="background: white;">`
  
  // Generate a more realistic QR pattern
  for (let y = 0; y < 33; y++) {
    for (let x = 0; x < 33; x++) {
      // Create finder patterns (corners)
      const isFinderPattern = (
        (x < 7 && y < 7) || 
        (x >= 26 && y < 7) || 
        (x < 7 && y >= 26)
      )
      
      if (isFinderPattern) {
        const isOuterBorder = (x === 0 || x === 6 || y === 0 || y === 6 || x === 26 || x === 32 || y === 26 || y === 32)
        const isInnerSquare = (
          (x >= 2 && x <= 4 && y >= 2 && y <= 4) ||
          (x >= 28 && x <= 30 && y >= 2 && y <= 4) ||
          (x >= 2 && x <= 4 && y >= 28 && y <= 30)
        )
        
        if (isOuterBorder || isInnerSquare) {
          svg += `<rect x="${x * cellSize}" y="${y * cellSize}" width="${cellSize}" height="${cellSize}" fill="black"/>`
        }
      } else {
        // Generate data pattern based on hash
        const shouldFill = ((hash + x * 31 + y * 17) % 100) > 45
        if (shouldFill) {
          svg += `<rect x="${x * cellSize}" y="${y * cellSize}" width="${cellSize}" height="${cellSize}" fill="black"/>`
        }
      }
    }
  }
  
  // Add timing patterns
  for (let i = 8; i < 25; i++) {
    if (i % 2 === 0) {
      svg += `<rect x="${i * cellSize}" y="${6 * cellSize}" width="${cellSize}" height="${cellSize}" fill="black"/>`
      svg += `<rect x="${6 * cellSize}" y="${i * cellSize}" width="${cellSize}" height="${cellSize}" fill="black"/>`
    }
  }
  
  svg += '</svg>'
  
  return `data:image/svg+xml;base64,${btoa(svg)}`
}
