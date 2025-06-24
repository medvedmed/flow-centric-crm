
-- Update whatsapp_sessions table to support phone-based authentication
ALTER TABLE whatsapp_sessions 
DROP COLUMN IF EXISTS qr_code,
DROP COLUMN IF EXISTS qr_image_data,
DROP COLUMN IF EXISTS client_id,
DROP COLUMN IF EXISTS session_key,
DROP COLUMN IF EXISTS encrypted_session,
DROP COLUMN IF EXISTS client_token,
DROP COLUMN IF EXISTS server_token,
DROP COLUMN IF EXISTS device_info;

-- Add phone-based authentication columns
ALTER TABLE whatsapp_sessions 
ADD COLUMN IF NOT EXISTS verification_code VARCHAR(6),
ADD COLUMN IF NOT EXISTS verification_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS verification_attempts INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS max_verification_attempts INTEGER DEFAULT 3,
ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS business_account_id TEXT,
ADD COLUMN IF NOT EXISTS access_token TEXT;

-- Update connection_state enum values for phone verification
ALTER TABLE whatsapp_sessions 
ALTER COLUMN connection_state SET DEFAULT 'phone_required';

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_whatsapp_sessions_phone_salon 
ON whatsapp_sessions(phone_number, salon_id);

-- Create function to clean up expired verification codes
CREATE OR REPLACE FUNCTION cleanup_expired_verification_codes()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE whatsapp_sessions 
  SET verification_code = NULL,
      verification_expires_at = NULL,
      verification_attempts = 0
  WHERE verification_expires_at < NOW();
END;
$$;
