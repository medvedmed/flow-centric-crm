
-- Create reminder_settings table to store salon owner preferences
CREATE TABLE public.reminder_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  salon_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reminder_timing TEXT NOT NULL DEFAULT '24_hours' CHECK (reminder_timing IN ('24_hours', '2_hours')),
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  message_template TEXT NOT NULL DEFAULT 'Hi {clientName}! This is a reminder for your {service} appointment tomorrow at {time}. See you at the salon!',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(salon_id)
);

-- Create appointment_reminders table to track sent reminders
CREATE TABLE public.appointment_reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('24_hours', '2_hours')),
  scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'ready', 'sent', 'skipped')),
  whatsapp_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(appointment_id, reminder_type)
);

-- Add RLS policies for reminder_settings
ALTER TABLE public.reminder_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Salon owners can manage their reminder settings" 
  ON public.reminder_settings 
  FOR ALL 
  USING (salon_id = auth.uid());

-- Add RLS policies for appointment_reminders  
ALTER TABLE public.appointment_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view reminders for their salon appointments" 
  ON public.appointment_reminders 
  FOR SELECT 
  USING (
    appointment_id IN (
      SELECT id FROM public.appointments WHERE salon_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage reminders for their salon appointments" 
  ON public.appointment_reminders 
  FOR ALL 
  USING (
    appointment_id IN (
      SELECT id FROM public.appointments WHERE salon_id = auth.uid()
    )
  );

-- Add trigger to update updated_at column for reminder_settings
CREATE TRIGGER update_reminder_settings_updated_at
  BEFORE UPDATE ON public.reminder_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add trigger to update updated_at column for appointment_reminders
CREATE TRIGGER update_appointment_reminders_updated_at
  BEFORE UPDATE ON public.appointment_reminders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for reminder tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.reminder_settings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.appointment_reminders;

-- Set replica identity for realtime updates
ALTER TABLE public.reminder_settings REPLICA IDENTITY FULL;
ALTER TABLE public.appointment_reminders REPLICA IDENTITY FULL;

-- Create functions to interact with reminder tables

-- Function to get reminder settings for current user
CREATE OR REPLACE FUNCTION public.get_reminder_settings()
RETURNS TABLE (
  id UUID,
  salon_id UUID,
  reminder_timing TEXT,
  is_enabled BOOLEAN,
  message_template TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT 
    rs.id,
    rs.salon_id,
    rs.reminder_timing,
    rs.is_enabled,
    rs.message_template,
    rs.created_at,
    rs.updated_at
  FROM public.reminder_settings rs
  WHERE rs.salon_id = auth.uid()
  LIMIT 1;
$$;

-- Function to get all reminder settings (for edge function)
CREATE OR REPLACE FUNCTION public.get_all_reminder_settings()
RETURNS TABLE (
  id UUID,
  salon_id UUID,
  reminder_timing TEXT,
  is_enabled BOOLEAN,
  message_template TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT 
    rs.id,
    rs.salon_id,
    rs.reminder_timing,
    rs.is_enabled,
    rs.message_template,
    rs.created_at,
    rs.updated_at
  FROM public.reminder_settings rs
  WHERE rs.is_enabled = true;
$$;

-- Function to create reminder settings
CREATE OR REPLACE FUNCTION public.create_reminder_settings(
  reminder_timing_param TEXT,
  is_enabled_param BOOLEAN,
  message_template_param TEXT
)
RETURNS TABLE (
  id UUID,
  salon_id UUID,
  reminder_timing TEXT,
  is_enabled BOOLEAN,
  message_template TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE PLPGSQL
SECURITY DEFINER
AS $$
DECLARE
  result_record RECORD;
BEGIN
  INSERT INTO public.reminder_settings (
    salon_id,
    reminder_timing,
    is_enabled,
    message_template
  ) VALUES (
    auth.uid(),
    reminder_timing_param,
    is_enabled_param,
    message_template_param
  ) RETURNING * INTO result_record;
  
  RETURN QUERY SELECT 
    result_record.id,
    result_record.salon_id,
    result_record.reminder_timing,
    result_record.is_enabled,
    result_record.message_template,
    result_record.created_at,
    result_record.updated_at;
END;
$$;

-- Function to update reminder settings
CREATE OR REPLACE FUNCTION public.update_reminder_settings(
  reminder_timing_param TEXT,
  is_enabled_param BOOLEAN,
  message_template_param TEXT
)
RETURNS TABLE (
  id UUID,
  salon_id UUID,
  reminder_timing TEXT,
  is_enabled BOOLEAN,
  message_template TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE PLPGSQL
SECURITY DEFINER
AS $$
DECLARE
  result_record RECORD;
BEGIN
  UPDATE public.reminder_settings 
  SET 
    reminder_timing = reminder_timing_param,
    is_enabled = is_enabled_param,
    message_template = message_template_param,
    updated_at = now()
  WHERE salon_id = auth.uid()
  RETURNING * INTO result_record;
  
  RETURN QUERY SELECT 
    result_record.id,
    result_record.salon_id,
    result_record.reminder_timing,
    result_record.is_enabled,
    result_record.message_template,
    result_record.created_at,
    result_record.updated_at;
END;
$$;

-- Function to get appointment reminders
CREATE OR REPLACE FUNCTION public.get_appointment_reminders(status_filter TEXT DEFAULT NULL)
RETURNS TABLE (
  id UUID,
  appointment_id UUID,
  reminder_type TEXT,
  scheduled_time TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  status TEXT,
  whatsapp_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT 
    ar.id,
    ar.appointment_id,
    ar.reminder_type,
    ar.scheduled_time,
    ar.sent_at,
    ar.status,
    ar.whatsapp_url,
    ar.created_at,
    ar.updated_at
  FROM public.appointment_reminders ar
  JOIN public.appointments a ON ar.appointment_id = a.id
  WHERE a.salon_id = auth.uid()
    AND (status_filter IS NULL OR ar.status = status_filter)
  ORDER BY ar.scheduled_time ASC;
$$;

-- Function to check if reminder exists
CREATE OR REPLACE FUNCTION public.check_reminder_exists(
  appointment_id_param UUID,
  reminder_type_param TEXT
)
RETURNS TABLE (id UUID)
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT ar.id
  FROM public.appointment_reminders ar
  WHERE ar.appointment_id = appointment_id_param
    AND ar.reminder_type = reminder_type_param
  LIMIT 1;
$$;

-- Function to create appointment reminder
CREATE OR REPLACE FUNCTION public.create_appointment_reminder(
  appointment_id_param UUID,
  reminder_type_param TEXT,
  scheduled_time_param TIMESTAMP WITH TIME ZONE,
  whatsapp_url_param TEXT
)
RETURNS UUID
LANGUAGE PLPGSQL
SECURITY DEFINER
AS $$
DECLARE
  reminder_id UUID;
BEGIN
  INSERT INTO public.appointment_reminders (
    appointment_id,
    reminder_type,
    scheduled_time,
    status,
    whatsapp_url
  ) VALUES (
    appointment_id_param,
    reminder_type_param,
    scheduled_time_param,
    'ready',
    whatsapp_url_param
  ) RETURNING id INTO reminder_id;
  
  RETURN reminder_id;
END;
$$;

-- Function to update reminder status
CREATE OR REPLACE FUNCTION public.update_reminder_status(
  reminder_id UUID,
  new_status TEXT
)
RETURNS VOID
LANGUAGE PLPGSQL
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.appointment_reminders 
  SET 
    status = new_status,
    sent_at = CASE WHEN new_status = 'sent' THEN now() ELSE NULL END,
    updated_at = now()
  WHERE id = reminder_id
    AND appointment_id IN (
      SELECT a.id FROM public.appointments a WHERE a.salon_id = auth.uid()
    );
END;
$$;
