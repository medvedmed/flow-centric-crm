
-- Enhanced salon profiles with complete business information
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS opening_hours TIME;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS closing_hours TIME;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS working_days TEXT[];
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS social_media JSONB;

-- WhatsApp integration table for session management
CREATE TABLE IF NOT EXISTS public.whatsapp_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_data JSONB,
  is_connected BOOLEAN DEFAULT false,
  last_connected_at TIMESTAMP WITH TIME ZONE,
  phone_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enhanced reminder settings with more automation options
ALTER TABLE public.reminder_settings ADD COLUMN IF NOT EXISTS auto_send BOOLEAN DEFAULT false;
ALTER TABLE public.reminder_settings ADD COLUMN IF NOT EXISTS optimal_send_time TIME DEFAULT '10:00:00';
ALTER TABLE public.reminder_settings ADD COLUMN IF NOT EXISTS follow_up_enabled BOOLEAN DEFAULT false;
ALTER TABLE public.reminder_settings ADD COLUMN IF NOT EXISTS follow_up_template TEXT;

-- Business analytics table for advanced reporting
CREATE TABLE IF NOT EXISTS public.business_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_appointments INTEGER DEFAULT 0,
  completed_appointments INTEGER DEFAULT 0,
  cancelled_appointments INTEGER DEFAULT 0,
  no_show_appointments INTEGER DEFAULT 0,
  daily_revenue NUMERIC DEFAULT 0,
  new_clients INTEGER DEFAULT 0,
  returning_clients INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(salon_id, date)
);

-- Enable RLS on new tables
ALTER TABLE public.whatsapp_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_analytics ENABLE ROW LEVEL SECURITY;

-- RLS policies for WhatsApp sessions
CREATE POLICY "Users can manage their own WhatsApp sessions" 
ON public.whatsapp_sessions 
FOR ALL 
USING (auth.uid() = salon_id);

-- RLS policies for business analytics
CREATE POLICY "Users can view their own analytics" 
ON public.business_analytics 
FOR ALL 
USING (auth.uid() = salon_id);

-- Function to update business analytics automatically
CREATE OR REPLACE FUNCTION public.update_daily_analytics()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.business_analytics (
    salon_id, 
    date, 
    total_appointments,
    completed_appointments,
    cancelled_appointments,
    no_show_appointments,
    daily_revenue
  )
  SELECT 
    NEW.salon_id,
    NEW.date,
    COUNT(*),
    COUNT(*) FILTER (WHERE status = 'Completed'),
    COUNT(*) FILTER (WHERE status = 'Cancelled'),
    COUNT(*) FILTER (WHERE status = 'No Show'),
    COALESCE(SUM(price) FILTER (WHERE status = 'Completed'), 0)
  FROM public.appointments 
  WHERE salon_id = NEW.salon_id AND date = NEW.date
  GROUP BY salon_id, date
  ON CONFLICT (salon_id, date) 
  DO UPDATE SET
    total_appointments = EXCLUDED.total_appointments,
    completed_appointments = EXCLUDED.completed_appointments,
    cancelled_appointments = EXCLUDED.cancelled_appointments,
    no_show_appointments = EXCLUDED.no_show_appointments,
    daily_revenue = EXCLUDED.daily_revenue;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update analytics on appointment changes
DROP TRIGGER IF EXISTS update_analytics_trigger ON public.appointments;
CREATE TRIGGER update_analytics_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.update_daily_analytics();

-- Enable real-time for critical tables
ALTER TABLE public.appointments REPLICA IDENTITY FULL;
ALTER TABLE public.clients REPLICA IDENTITY FULL;
ALTER TABLE public.staff REPLICA IDENTITY FULL;
ALTER TABLE public.appointment_reminders REPLICA IDENTITY FULL;

-- Add tables to realtime publication
DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime FOR TABLE 
  public.appointments,
  public.clients, 
  public.staff,
  public.appointment_reminders,
  public.business_analytics,
  public.whatsapp_sessions;
