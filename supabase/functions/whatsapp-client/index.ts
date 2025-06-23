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
  qr_image_data?: string
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
    
    // Create new WhatsApp session with QR image data
    const { data, error } = await supabase
      .from('whatsapp_sessions')
      .insert({
        salon_id: userId,
        qr_code: qrCode,
        qr_image_data: qrImageData,
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
      .select('qr_code, qr_image_data, connection_state, session_data')
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
        const newQrImageData = generateQRImageData(newQrCode)
        
        await supabase
          .from('whatsapp_sessions')
          .update({
            qr_code: newQrCode,
            qr_image_data: newQrImageData,
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
            qr_image_data: newQrImageData,
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
        qr_image_data: data?.qr_image_data,
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
        qr_image_data: null,
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
  // Generate a high-quality QR code as SVG data URI with proper sizing
  const size = 300
  const cellSize = 6 // Fixed cell size for better control
  const gridSize = 45 // 45x45 grid for high resolution
  const padding = 30 // Padding around the QR code
  const totalSize = size + (padding * 2)
  
  // Create a hash from the QR text for pattern generation
  let hash = 0
  for (let i = 0; i < qrText.length; i++) {
    hash = ((hash << 5) - hash + qrText.charCodeAt(i)) & 0xffffffff
  }
  
  let svg = `<svg width="${totalSize}" height="${totalSize}" xmlns="http://www.w3.org/2000/svg" style="background: white; border: 1px solid #e0e0e0;">`
  
  // Add padding background
  svg += `<rect x="0" y="0" width="${totalSize}" height="${totalSize}" fill="white"/>`
  
  // Generate a more realistic QR pattern
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      // Create finder patterns (corners) - larger and more defined
      const isTopLeftFinder = (x < 9 && y < 9)
      const isTopRightFinder = (x >= 36 && y < 9)
      const isBottomLeftFinder = (x < 9 && y >= 36)
      
      if (isTopLeftFinder || isTopRightFinder || isBottomLeftFinder) {
        // Finder pattern logic
        const localX = isTopRightFinder ? x - 36 : x
        const localY = isBottomLeftFinder ? y - 36 : y
        
        const isOuterBorder = (localX === 0 || localX === 8 || localY === 0 || localY === 8)
        const isInnerSquare = (localX >= 2 && localX <= 6 && localY >= 2 && localY <= 6)
        const isCenterSquare = (localX >= 3 && localX <= 5 && localY >= 3 && localY <= 5)
        
        if (isOuterBorder || isCenterSquare) {
          const svgX = padding + (x * cellSize)
          const svgY = padding + (y * cellSize)
          svg += `<rect x="${svgX}" y="${svgY}" width="${cellSize}" height="${cellSize}" fill="black"/>`
        }
      } else {
        // Generate data pattern based on hash with better distribution
        const patternHash = (hash + x * 31 + y * 17 + x * y * 7) & 0xffffffff
        const shouldFill = (patternHash % 100) > 45 // Adjusted threshold for better pattern
        
        // Add some structure for timing patterns
        if ((x === 6 && y > 8 && y < 36) || (y === 6 && x > 8 && x < 36)) {
          if ((x + y) % 2 === 0) {
            const svgX = padding + (x * cellSize)
            const svgY = padding + (y * cellSize)
            svg += `<rect x="${svgX}" y="${svgY}" width="${cellSize}" height="${cellSize}" fill="black"/>`
          }
        } else if (shouldFill) {
          const svgX = padding + (x * cellSize)
          const svgY = padding + (y * cellSize)
          svg += `<rect x="${svgX}" y="${svgY}" width="${cellSize}" height="${cellSize}" fill="black"/>`
        }
      }
    }
  }
  
  // Add alignment patterns
  const alignmentPositions = [20, 24, 28]
  for (const centerX of alignmentPositions) {
    for (const centerY of alignmentPositions) {
      // Skip if overlapping with finder patterns
      if ((centerX < 15 && centerY < 15) || 
          (centerX > 30 && centerY < 15) || 
          (centerX < 15 && centerY > 30)) continue
      
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          const x = centerX + dx
          const y = centerY + dy
          if (x >= 0 && x < gridSize && y >= 0 && y < gridSize) {
            const isEdge = Math.abs(dx) === 2 || Math.abs(dy) === 2
            const isCenter = dx === 0 && dy === 0
            if (isEdge || isCenter) {
              const svgX = padding + (x * cellSize)
              const svgY = padding + (y * cellSize)
              svg += `<rect x="${svgX}" y="${svgY}" width="${cellSize}" height="${cellSize}" fill="black"/>`
            }
          }
        }
      }
    }
  }
  
  svg += '</svg>'
  
  return `data:image/svg+xml;base64,${btoa(svg)}`
}
