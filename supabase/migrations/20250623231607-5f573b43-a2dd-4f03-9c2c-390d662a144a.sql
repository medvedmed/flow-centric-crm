
-- Update whatsapp_sessions table to support real WhatsApp Web sessions
ALTER TABLE public.whatsapp_sessions 
ADD COLUMN IF NOT EXISTS session_key text,
ADD COLUMN IF NOT EXISTS client_id text,
ADD COLUMN IF NOT EXISTS server_token text,
ADD COLUMN IF NOT EXISTS client_token text,
ADD COLUMN IF NOT EXISTS encrypted_session text,
ADD COLUMN IF NOT EXISTS qr_code text,
ADD COLUMN IF NOT EXISTS connection_state text DEFAULT 'disconnected',
ADD COLUMN IF NOT EXISTS last_seen timestamp with time zone,
ADD COLUMN IF NOT EXISTS device_info jsonb;

-- Update the connection status values
UPDATE public.whatsapp_sessions 
SET connection_state = CASE 
  WHEN is_connected = true THEN 'connected'
  ELSE 'disconnected'
END;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_whatsapp_sessions_salon_connection 
ON public.whatsapp_sessions(salon_id, connection_state);

-- Create table for WhatsApp message logs
CREATE TABLE IF NOT EXISTS public.whatsapp_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  salon_id uuid NOT NULL,
  recipient_phone text NOT NULL,
  recipient_name text,
  message_content text NOT NULL,
  message_type text DEFAULT 'text',
  whatsapp_message_id text,
  status text DEFAULT 'pending', -- pending, sent, delivered, read, failed
  sent_at timestamp with time zone,
  delivered_at timestamp with time zone,
  read_at timestamp with time zone,
  error_message text,
  appointment_id uuid,
  reminder_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add RLS policies for whatsapp_messages
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own WhatsApp messages" 
  ON public.whatsapp_messages 
  FOR SELECT 
  USING (salon_id = auth.uid());

CREATE POLICY "Users can create their own WhatsApp messages" 
  ON public.whatsapp_messages 
  FOR INSERT 
  WITH CHECK (salon_id = auth.uid());

CREATE POLICY "Users can update their own WhatsApp messages" 
  ON public.whatsapp_messages 
  FOR UPDATE 
  USING (salon_id = auth.uid());

-- Add trigger for updated_at
CREATE TRIGGER update_whatsapp_messages_updated_at
  BEFORE UPDATE ON public.whatsapp_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to get WhatsApp session for current user
CREATE OR REPLACE FUNCTION public.get_whatsapp_session()
RETURNS TABLE(
  id uuid,
  salon_id uuid,
  phone_number text,
  is_connected boolean,
  connection_state text,
  qr_code text,
  last_connected_at timestamp with time zone,
  last_seen timestamp with time zone,
  device_info jsonb
)
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT 
    ws.id,
    ws.salon_id,
    ws.phone_number,
    ws.is_connected,
    ws.connection_state,
    ws.qr_code,
    ws.last_connected_at,
    ws.last_seen,
    ws.device_info
  FROM public.whatsapp_sessions ws
  WHERE ws.salon_id = auth.uid()
  ORDER BY ws.updated_at DESC
  LIMIT 1;
$$;
