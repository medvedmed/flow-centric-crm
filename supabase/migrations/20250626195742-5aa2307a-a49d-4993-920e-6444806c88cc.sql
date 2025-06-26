
-- Add WhatsApp automation settings table
CREATE TABLE IF NOT EXISTS public.whatsapp_automation_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  salon_id uuid NOT NULL,
  is_enabled boolean DEFAULT true,
  reminder_24h_enabled boolean DEFAULT true,
  reminder_2h_enabled boolean DEFAULT false,
  reminder_1h_enabled boolean DEFAULT false,
  custom_reminder_minutes integer DEFAULT NULL,
  message_template_24h text DEFAULT 'Hi {clientName}! This is a reminder for your {service} appointment tomorrow at {time}. See you at {salonName}!',
  message_template_2h text DEFAULT 'Hi {clientName}! Your {service} appointment is in 2 hours at {time}. See you soon at {salonName}!',
  message_template_1h text DEFAULT 'Hi {clientName}! Your {service} appointment is in 1 hour at {time}. We''re ready for you at {salonName}!',
  follow_up_enabled boolean DEFAULT false,
  follow_up_template text DEFAULT 'Hi {clientName}! How was your {service} appointment? We''d love your feedback!',
  follow_up_delay_hours integer DEFAULT 2,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add RLS policies for automation settings
ALTER TABLE public.whatsapp_automation_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own automation settings" 
  ON public.whatsapp_automation_settings 
  FOR SELECT 
  USING (salon_id = auth.uid());

CREATE POLICY "Users can create their own automation settings" 
  ON public.whatsapp_automation_settings 
  FOR INSERT 
  WITH CHECK (salon_id = auth.uid());

CREATE POLICY "Users can update their own automation settings" 
  ON public.whatsapp_automation_settings 
  FOR UPDATE 
  USING (salon_id = auth.uid());

-- Add trigger for updated_at
CREATE TRIGGER update_whatsapp_automation_settings_updated_at
  BEFORE UPDATE ON public.whatsapp_automation_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create WhatsApp reminder queue table
CREATE TABLE IF NOT EXISTS public.whatsapp_reminder_queue (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  salon_id uuid NOT NULL,
  appointment_id uuid NOT NULL,
  client_phone text NOT NULL,
  client_name text NOT NULL,
  message_content text NOT NULL,
  reminder_type text NOT NULL, -- '24h', '2h', '1h', 'custom', 'follow_up'
  scheduled_time timestamp with time zone NOT NULL,
  status text DEFAULT 'pending', -- 'pending', 'sent', 'failed', 'cancelled'
  attempts integer DEFAULT 0,
  max_attempts integer DEFAULT 3,
  sent_at timestamp with time zone,
  error_message text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add RLS policies for reminder queue
ALTER TABLE public.whatsapp_reminder_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own reminder queue" 
  ON public.whatsapp_reminder_queue 
  FOR SELECT 
  USING (salon_id = auth.uid());

CREATE POLICY "Users can create their own reminder queue entries" 
  ON public.whatsapp_reminder_queue 
  FOR INSERT 
  WITH CHECK (salon_id = auth.uid());

CREATE POLICY "Users can update their own reminder queue entries" 
  ON public.whatsapp_reminder_queue 
  FOR UPDATE 
  USING (salon_id = auth.uid());

-- Add trigger for updated_at
CREATE TRIGGER update_whatsapp_reminder_queue_updated_at
  BEFORE UPDATE ON public.whatsapp_reminder_queue
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_whatsapp_reminder_queue_scheduled_time 
ON public.whatsapp_reminder_queue(scheduled_time, status);

CREATE INDEX IF NOT EXISTS idx_whatsapp_reminder_queue_appointment 
ON public.whatsapp_reminder_queue(appointment_id);

-- Function to automatically create reminders when appointments are created
CREATE OR REPLACE FUNCTION public.create_whatsapp_reminders()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  automation_settings RECORD;
  reminder_24h_time timestamp with time zone;
  reminder_2h_time timestamp with time zone;
  reminder_1h_time timestamp with time zone;
  appointment_datetime timestamp with time zone;
BEGIN
  -- Only create reminders for future appointments
  appointment_datetime := (NEW.date + NEW.start_time);
  
  IF appointment_datetime <= NOW() THEN
    RETURN NEW;
  END IF;

  -- Get automation settings for this salon
  SELECT * INTO automation_settings 
  FROM public.whatsapp_automation_settings 
  WHERE salon_id = NEW.salon_id AND is_enabled = true;

  -- If no settings found or client has no phone, skip
  IF NOT FOUND OR NEW.client_phone IS NULL OR NEW.client_phone = '' THEN
    RETURN NEW;
  END IF;

  -- Calculate reminder times
  reminder_24h_time := appointment_datetime - INTERVAL '24 hours';
  reminder_2h_time := appointment_datetime - INTERVAL '2 hours';
  reminder_1h_time := appointment_datetime - INTERVAL '1 hour';

  -- Create 24h reminder if enabled and in future
  IF automation_settings.reminder_24h_enabled AND reminder_24h_time > NOW() THEN
    INSERT INTO public.whatsapp_reminder_queue (
      salon_id, appointment_id, client_phone, client_name, 
      message_content, reminder_type, scheduled_time
    ) VALUES (
      NEW.salon_id, NEW.id, NEW.client_phone, NEW.client_name,
      replace(replace(replace(automation_settings.message_template_24h, 
        '{clientName}', NEW.client_name), 
        '{service}', NEW.service), 
        '{time}', NEW.start_time::text),
      '24h', reminder_24h_time
    );
  END IF;

  -- Create 2h reminder if enabled and in future
  IF automation_settings.reminder_2h_enabled AND reminder_2h_time > NOW() THEN
    INSERT INTO public.whatsapp_reminder_queue (
      salon_id, appointment_id, client_phone, client_name, 
      message_content, reminder_type, scheduled_time
    ) VALUES (
      NEW.salon_id, NEW.id, NEW.client_phone, NEW.client_name,
      replace(replace(replace(automation_settings.message_template_2h, 
        '{clientName}', NEW.client_name), 
        '{service}', NEW.service), 
        '{time}', NEW.start_time::text),
      '2h', reminder_2h_time
    );
  END IF;

  -- Create 1h reminder if enabled and in future
  IF automation_settings.reminder_1h_enabled AND reminder_1h_time > NOW() THEN
    INSERT INTO public.whatsapp_reminder_queue (
      salon_id, appointment_id, client_phone, client_name, 
      message_content, reminder_type, scheduled_time
    ) VALUES (
      NEW.salon_id, NEW.id, NEW.client_phone, NEW.client_name,
      replace(replace(replace(automation_settings.message_template_1h, 
        '{clientName}', NEW.client_name), 
        '{service}', NEW.service), 
        '{time}', NEW.start_time::text),
      '1h', reminder_1h_time
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger to automatically create reminders
CREATE TRIGGER create_whatsapp_reminders_trigger
  AFTER INSERT ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.create_whatsapp_reminders();

-- Function to get pending reminders that need to be sent
CREATE OR REPLACE FUNCTION public.get_pending_whatsapp_reminders()
RETURNS TABLE(
  id uuid,
  salon_id uuid,
  appointment_id uuid,
  client_phone text,
  client_name text,
  message_content text,
  reminder_type text,
  scheduled_time timestamp with time zone
)
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT 
    r.id,
    r.salon_id,
    r.appointment_id,
    r.client_phone,
    r.client_name,
    r.message_content,
    r.reminder_type,
    r.scheduled_time
  FROM public.whatsapp_reminder_queue r
  WHERE r.status = 'pending'
    AND r.scheduled_time <= NOW()
    AND r.attempts < r.max_attempts
  ORDER BY r.scheduled_time ASC;
$$;
