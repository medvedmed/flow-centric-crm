
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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '', // Use service role for cron jobs
    )

    console.log('Processing WhatsApp reminder queue...')

    // Get all pending reminders that are due
    const { data: pendingReminders, error } = await supabaseClient
      .rpc('get_pending_whatsapp_reminders')

    if (error) {
      console.error('Error fetching pending reminders:', error)
      throw error
    }

    if (!pendingReminders || pendingReminders.length === 0) {
      console.log('No pending reminders to process')
      return new Response(
        JSON.stringify({ success: true, processed: 0, message: 'No reminders to process' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Found ${pendingReminders.length} pending reminders`)

    let processedCount = 0
    let failedCount = 0

    // Process reminders in batches to avoid overwhelming the system
    for (const reminder of pendingReminders.slice(0, 10)) { // Process max 10 at a time
      try {
        console.log(`Processing reminder ${reminder.id} for client ${reminder.client_name}`)

        // Check if the salon has an active WhatsApp session
        const { data: session } = await supabaseClient
          .from('whatsapp_sessions')
          .select('is_connected')
          .eq('salon_id', reminder.salon_id)
          .single()

        if (!session?.is_connected) {
          console.log(`Skipping reminder ${reminder.id} - WhatsApp not connected for salon ${reminder.salon_id}`)
          
          // Update reminder status to failed
          await supabaseClient
            .from('whatsapp_reminder_queue')
            .update({
              status: 'failed',
              error_message: 'WhatsApp session not connected',
              attempts: reminder.attempts ? reminder.attempts + 1 : 1
            })
            .eq('id', reminder.id)

          failedCount++
          continue
        }

        // Call the enhanced WhatsApp function to send the message
        const { data: sendResult, error: sendError } = await supabaseClient.functions.invoke(
          'whatsapp-web-enhanced',
          {
            body: {
              action: 'send_message',
              phone: reminder.client_phone,
              message: reminder.message_content
            }
          }
        )

        if (sendError) {
          console.error(`Failed to send reminder ${reminder.id}:`, sendError)
          
          // Update reminder status to failed
          await supabaseClient
            .from('whatsapp_reminder_queue')
            .update({
              status: 'failed',
              error_message: sendError.message,
              attempts: reminder.attempts ? reminder.attempts + 1 : 1
            })
            .eq('id', reminder.id)

          failedCount++
        } else {
          console.log(`Successfully sent reminder ${reminder.id}`)
          
          // Update reminder status to sent
          await supabaseClient
            .from('whatsapp_reminder_queue')
            .update({
              status: 'sent',
              sent_at: new Date().toISOString(),
              attempts: reminder.attempts ? reminder.attempts + 1 : 1
            })
            .eq('id', reminder.id)

          processedCount++
        }

        // Add a small delay between messages to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000))

      } catch (error) {
        console.error(`Error processing reminder ${reminder.id}:`, error)
        
        // Update reminder status to failed
        await supabaseClient
          .from('whatsapp_reminder_queue')
          .update({
            status: 'failed',
            error_message: error.message,
            attempts: reminder.attempts ? reminder.attempts + 1 : 1
          })
          .eq('id', reminder.id)

        failedCount++
      }
    }

    console.log(`Reminder processing complete. Processed: ${processedCount}, Failed: ${failedCount}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: processedCount,
        failed: failedCount,
        total_found: pendingReminders.length
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
