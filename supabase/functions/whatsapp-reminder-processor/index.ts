
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    console.log('Processing WhatsApp reminder queue...')

    // First, mark pending reminders as processing
    await supabaseClient.rpc('process_whatsapp_reminders')

    // Get reminders that are ready for processing
    const { data: reminders, error: fetchError } = await supabaseClient
      .rpc('get_reminders_for_processing')

    if (fetchError) {
      console.error('Error fetching reminders:', fetchError)
      throw fetchError
    }

    if (!reminders || reminders.length === 0) {
      console.log('No reminders to process')
      return new Response(
        JSON.stringify({ success: true, processed: 0, message: 'No reminders to process' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Found ${reminders.length} reminders to process`)

    let processedCount = 0
    let failedCount = 0

    // Process each reminder
    for (const reminder of reminders) {
      try {
        console.log(`Processing reminder ${reminder.id} for ${reminder.client_name}`)

        // Check if the salon has an active WhatsApp session
        const { data: session } = await supabaseClient
          .from('whatsapp_sessions')
          .select('is_connected, connection_state')
          .eq('salon_id', reminder.salon_id)
          .single()

        if (!session?.is_connected || session.connection_state !== 'ready') {
          console.log(`Skipping reminder ${reminder.id} - WhatsApp not connected for salon ${reminder.salon_id}`)
          
          await supabaseClient.rpc('update_reminder_after_sending', {
            reminder_id: reminder.id,
            new_status: 'failed',
            error_msg: 'WhatsApp session not connected'
          })

          failedCount++
          continue
        }

        // Send the message via WhatsApp server
        const whatsappServerUrl = 'http://localhost:3020/send'
        const sendResponse = await fetch(whatsappServerUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Salon-ID': reminder.salon_id
          },
          body: JSON.stringify({
            phone: reminder.client_phone,
            message: reminder.message_content,
            appointmentId: reminder.appointment_id,
            salon_id: reminder.salon_id
          })
        })

        if (!sendResponse.ok) {
          const error = await sendResponse.json().catch(() => ({ error: 'Send failed' }))
          throw new Error(error.error || 'Failed to send message')
        }

        const result = await sendResponse.json()
        console.log(`Successfully sent reminder ${reminder.id}`)

        // Update reminder status to sent
        await supabaseClient.rpc('update_reminder_after_sending', {
          reminder_id: reminder.id,
          new_status: 'sent'
        })

        // Log the message in the messages table
        await supabaseClient
          .from('whatsapp_messages')
          .insert({
            salon_id: reminder.salon_id,
            recipient_phone: reminder.client_phone,
            recipient_name: reminder.client_name,
            message_content: reminder.message_content,
            status: 'sent',
            appointment_id: reminder.appointment_id,
            whatsapp_message_id: result.message_id || null
          })

        processedCount++

        // Add delay between messages to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000))

      } catch (error) {
        console.error(`Error processing reminder ${reminder.id}:`, error)
        
        await supabaseClient.rpc('update_reminder_after_sending', {
          reminder_id: reminder.id,
          new_status: 'failed',
          error_msg: error.message
        })

        failedCount++
      }
    }

    console.log(`Reminder processing complete. Processed: ${processedCount}, Failed: ${failedCount}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: processedCount,
        failed: failedCount,
        total_found: reminders.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('WhatsApp reminder processing error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
