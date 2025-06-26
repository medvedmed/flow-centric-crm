
-- Add salon_id context to WhatsApp sessions and ensure proper RLS
ALTER TABLE public.whatsapp_sessions 
DROP CONSTRAINT IF EXISTS whatsapp_sessions_salon_id_unique;

-- Add unique constraint per salon
ALTER TABLE public.whatsapp_sessions 
ADD CONSTRAINT whatsapp_sessions_salon_id_unique UNIQUE (salon_id);

-- Enable RLS on WhatsApp tables if not already enabled
ALTER TABLE public.whatsapp_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_automation_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_reminder_queue ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for WhatsApp sessions
DROP POLICY IF EXISTS "Users can view their own WhatsApp sessions" ON public.whatsapp_sessions;
CREATE POLICY "Users can view their own WhatsApp sessions" 
  ON public.whatsapp_sessions 
  FOR ALL 
  USING (salon_id = auth.uid());

-- Create RLS policies for WhatsApp messages
DROP POLICY IF EXISTS "Users can view their own WhatsApp messages" ON public.whatsapp_messages;
CREATE POLICY "Users can view their own WhatsApp messages" 
  ON public.whatsapp_messages 
  FOR ALL 
  USING (salon_id = auth.uid());

-- Create RLS policies for automation settings
DROP POLICY IF EXISTS "Users can view their own automation settings" ON public.whatsapp_automation_settings;
CREATE POLICY "Users can view their own automation settings" 
  ON public.whatsapp_automation_settings 
  FOR ALL 
  USING (salon_id = auth.uid());

-- Create RLS policies for reminder queue
DROP POLICY IF EXISTS "Users can view their own reminder queue" ON public.whatsapp_reminder_queue;
CREATE POLICY "Users can view their own reminder queue" 
  ON public.whatsapp_reminder_queue 
  FOR ALL 
  USING (salon_id = auth.uid());

-- Create edge function to process WhatsApp reminders automatically
CREATE OR REPLACE FUNCTION public.process_whatsapp_reminders()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  reminder_record RECORD;
BEGIN
  -- Get all pending reminders that are due
  FOR reminder_record IN 
    SELECT * FROM public.whatsapp_reminder_queue 
    WHERE status = 'pending' 
      AND scheduled_time <= NOW() 
      AND attempts < max_attempts
    ORDER BY scheduled_time ASC
    LIMIT 50
  LOOP
    -- Update status to processing to avoid duplicate processing
    UPDATE public.whatsapp_reminder_queue 
    SET status = 'processing', 
        attempts = attempts + 1,
        updated_at = NOW()
    WHERE id = reminder_record.id;
    
    -- The actual sending will be handled by the edge function
    -- This just marks them as ready for processing
  END LOOP;
END;
$$;

-- Create function to get reminders ready for sending
CREATE OR REPLACE FUNCTION public.get_reminders_for_processing()
RETURNS TABLE (
  id uuid,
  salon_id uuid,
  appointment_id uuid,
  client_phone text,
  client_name text,
  message_content text,
  reminder_type text
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
    r.reminder_type
  FROM public.whatsapp_reminder_queue r
  WHERE r.status = 'processing'
  ORDER BY r.scheduled_time ASC;
$$;

-- Create function to update reminder status after processing
CREATE OR REPLACE FUNCTION public.update_reminder_after_sending(
  reminder_id uuid,
  new_status text,
  error_msg text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.whatsapp_reminder_queue
  SET status = new_status,
      sent_at = CASE WHEN new_status = 'sent' THEN NOW() ELSE sent_at END,
      error_message = error_msg,
      updated_at = NOW()
  WHERE id = reminder_id;
END;
$$;
