
-- Add qr_image_data column to whatsapp_sessions table if it doesn't exist
ALTER TABLE public.whatsapp_sessions 
ADD COLUMN IF NOT EXISTS qr_image_data text;

-- Update existing sessions to clear any corrupt data
UPDATE public.whatsapp_sessions 
SET qr_code = NULL, 
    qr_image_data = NULL, 
    connection_state = 'disconnected',
    is_connected = false
WHERE connection_state != 'disconnected' OR is_connected = true;
