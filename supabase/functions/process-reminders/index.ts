
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ReminderSettings {
  id: string;
  salon_id: string;
  reminder_timing: '24_hours' | '2_hours';
  is_enabled: boolean;
  message_template: string;
}

interface Appointment {
  id: string;
  client_id: string;
  client_name: string;
  service: string;
  date: string;
  start_time: string;
  salon_id: string;
  clients?: {
    phone: string;
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Starting reminder processing...');

    // Get all active reminder settings
    const { data: reminderSettings, error: settingsError } = await supabase
      .from('reminder_settings')
      .select('*')
      .eq('is_enabled', true);

    if (settingsError) {
      console.error('Error fetching reminder settings:', settingsError);
      throw settingsError;
    }

    console.log(`Found ${reminderSettings?.length || 0} active reminder settings`);

    let processedCount = 0;

    for (const settings of reminderSettings || []) {
      console.log(`Processing reminders for salon ${settings.salon_id}`);

      // Calculate target appointment time based on reminder timing
      const now = new Date();
      let targetTime: Date;
      
      if (settings.reminder_timing === '24_hours') {
        targetTime = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now
      } else {
        targetTime = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours from now
      }

      const targetDate = targetTime.toISOString().split('T')[0]; // YYYY-MM-DD format
      const targetTimeStart = new Date(targetTime.getTime() - 30 * 60 * 1000); // 30 min before
      const targetTimeEnd = new Date(targetTime.getTime() + 30 * 60 * 1000); // 30 min after

      // Find appointments that need reminders
      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select(`
          *,
          clients!inner(phone)
        `)
        .eq('salon_id', settings.salon_id)
        .eq('date', targetDate)
        .gte('start_time', targetTimeStart.toTimeString().split(' ')[0])
        .lte('start_time', targetTimeEnd.toTimeString().split(' ')[0])
        .in('status', ['Scheduled', 'Confirmed'])
        .not('clients.phone', 'is', null);

      if (appointmentsError) {
        console.error('Error fetching appointments:', appointmentsError);
        continue;
      }

      console.log(`Found ${appointments?.length || 0} appointments needing reminders`);

      for (const appointment of appointments || []) {
        // Check if reminder already exists
        const { data: existingReminder } = await supabase
          .from('appointment_reminders')
          .select('id')
          .eq('appointment_id', appointment.id)
          .eq('reminder_type', settings.reminder_timing)
          .single();

        if (existingReminder) {
          console.log(`Reminder already exists for appointment ${appointment.id}`);
          continue;
        }

        // Generate WhatsApp message
        let messageText = settings.message_template;
        messageText = messageText.replace('{clientName}', appointment.client_name);
        messageText = messageText.replace('{service}', appointment.service);
        messageText = messageText.replace('{time}', appointment.start_time);
        messageText = messageText.replace('{date}', appointment.date);

        // Clean phone number and create WhatsApp URL
        const phoneNumber = appointment.clients?.phone?.replace(/[^0-9]/g, '') || '';
        const encodedMessage = encodeURIComponent(messageText);
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

        // Insert reminder record
        const { error: insertError } = await supabase
          .from('appointment_reminders')
          .insert({
            appointment_id: appointment.id,
            reminder_type: settings.reminder_timing,
            scheduled_time: targetTime.toISOString(),
            status: 'ready',
            whatsapp_url: whatsappUrl
          });

        if (insertError) {
          console.error('Error inserting reminder:', insertError);
          continue;
        }

        processedCount++;
        console.log(`Created reminder for appointment ${appointment.id}`);
      }
    }

    console.log(`Reminder processing completed. Created ${processedCount} new reminders.`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        processedCount,
        message: `Created ${processedCount} new reminders` 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in process-reminders function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
