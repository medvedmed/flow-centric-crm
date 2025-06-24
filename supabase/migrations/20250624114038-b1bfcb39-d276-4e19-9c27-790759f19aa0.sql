
-- Create enhanced WhatsApp session management table
ALTER TABLE whatsapp_sessions 
ADD COLUMN IF NOT EXISTS webjs_session_data jsonb,
ADD COLUMN IF NOT EXISTS client_info jsonb,
ADD COLUMN IF NOT EXISTS webhook_url text,
ADD COLUMN IF NOT EXISTS rate_limit_reset timestamp with time zone DEFAULT now(),
ADD COLUMN IF NOT EXISTS messages_sent_today integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_activity timestamp with time zone DEFAULT now();

-- Create message queue table for WhatsApp Web.js
CREATE TABLE IF NOT EXISTS whatsapp_message_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id uuid NOT NULL,
  recipient_phone text NOT NULL,
  message_content text NOT NULL,
  message_type text DEFAULT 'text',
  priority integer DEFAULT 1,
  scheduled_for timestamp with time zone DEFAULT now(),
  attempts integer DEFAULT 0,
  max_attempts integer DEFAULT 3,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'sent', 'failed', 'cancelled')),
  error_message text,
  appointment_id uuid,
  reminder_type text,
  sent_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create WhatsApp contacts table for better contact management
CREATE TABLE IF NOT EXISTS whatsapp_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id uuid NOT NULL,
  phone_number text NOT NULL,
  contact_name text,
  is_business boolean DEFAULT false,
  profile_pic_url text,
  last_seen timestamp with time zone,
  is_blocked boolean DEFAULT false,
  client_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(salon_id, phone_number)
);

-- Create WhatsApp session logs for monitoring
CREATE TABLE IF NOT EXISTS whatsapp_session_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id uuid NOT NULL,
  event_type text NOT NULL,
  event_data jsonb,
  severity text DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'error', 'critical')),
  created_at timestamp with time zone DEFAULT now()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_whatsapp_message_queue_salon_status ON whatsapp_message_queue(salon_id, status);
CREATE INDEX IF NOT EXISTS idx_whatsapp_message_queue_scheduled ON whatsapp_message_queue(scheduled_for) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_whatsapp_contacts_salon_phone ON whatsapp_contacts(salon_id, phone_number);
CREATE INDEX IF NOT EXISTS idx_whatsapp_session_logs_salon_created ON whatsapp_session_logs(salon_id, created_at);

-- Enable RLS on new tables
ALTER TABLE whatsapp_message_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_session_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage their WhatsApp message queue" ON whatsapp_message_queue
  FOR ALL USING (salon_id = auth.uid());

CREATE POLICY "Users can manage their WhatsApp contacts" ON whatsapp_contacts
  FOR ALL USING (salon_id = auth.uid());

CREATE POLICY "Users can view their WhatsApp session logs" ON whatsapp_session_logs
  FOR SELECT USING (salon_id = auth.uid());

-- Create function to clean up old logs
CREATE OR REPLACE FUNCTION cleanup_old_whatsapp_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM whatsapp_session_logs 
  WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$;

-- Create function to reset daily message counts
CREATE OR REPLACE FUNCTION reset_daily_message_counts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE whatsapp_sessions 
  SET messages_sent_today = 0,
      rate_limit_reset = NOW()
  WHERE rate_limit_reset < CURRENT_DATE;
END;
$$;
