
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

    // Get all active reminder settings using RPC
    const { data: reminderSettings, error: settingsError } = await supabase
      .rpc('get_all_reminder_settings');

    if (settingsError) {
      console.error('Error fetching reminder settings:', settingsError);
      throw settingsError;
    }

    console.log(`Found ${reminderSettings?.length || 0} active reminder settings`);

    let processedCount = 0;

    for (const settings of reminderSettings || []) {
      console.log(`Processing reminders for salon ${settings.salon_id}`);

      // Calculate target appointment date/time based on reminder timing
      const now = new Date();
      let targetDate: string;
      let startTimeRange: { start: string; end: string };
      
      if (settings.reminder_timing === '24_hours') {
        // For 24-hour reminders, look for appointments tomorrow
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        targetDate = tomorrow.toISOString().split('T')[0]; // YYYY-MM-DD format
        
        // Look for appointments throughout the day
        startTimeRange = { start: '00:00:00', end: '23:59:59' };
      } else {
        // For 2-hour reminders, look for appointments today
        targetDate = now.toISOString().split('T')[0]; // YYYY-MM-DD format
        
        // Look for appointments starting in about 2 hours (give or take 30 minutes)
        const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);
        const startBuffer = new Date(twoHoursFromNow.getTime() - 30 * 60 * 1000);
        const endBuffer = new Date(twoHoursFromNow.getTime() + 30 * 60 * 1000);
        
        startTimeRange = {
          start: startBuffer.toTimeString().split(' ')[0],
          end: endBuffer.toTimeString().split(' ')[0]
        };
      }

      // Find appointments that need reminders
      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select(`
          *,
          clients!inner(phone)
        `)
        .eq('salon_id', settings.salon_id)
        .eq('date', targetDate)
        .gte('start_time', startTimeRange.start)
        .lte('start_time', startTimeRange.end)
        .in('status', ['Scheduled', 'Confirmed'])
        .not('clients.phone', 'is', null);

      if (appointmentsError) {
        console.error('Error fetching appointments:', appointmentsError);
        continue;
      }

      console.log(`Found ${appointments?.length || 0} appointments needing reminders`);

      for (const appointment of appointments || []) {
        // Check if reminder already exists using RPC
        const { data: existingReminder } = await supabase
          .rpc('check_reminder_exists', {
            appointment_id_param: appointment.id,
            reminder_type_param: settings.reminder_timing
          });

        if (existingReminder && existingReminder.length > 0) {
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

        // Calculate scheduled time for the reminder
        const appointmentDateTime = new Date(`${appointment.date}T${appointment.start_time}`);
        const scheduledTime = settings.reminder_timing === '24_hours' 
          ? new Date(appointmentDateTime.getTime() - 24 * 60 * 60 * 1000)
          : new Date(appointmentDateTime.getTime() - 2 * 60 * 60 * 1000);

        // Insert reminder record using RPC
        const { error: insertError } = await supabase
          .rpc('create_appointment_reminder', {
            appointment_id_param: appointment.id,
            reminder_type_param: settings.reminder_timing,
            scheduled_time_param: scheduledTime.toISOString(),
            whatsapp_url_param: whatsappUrl
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
