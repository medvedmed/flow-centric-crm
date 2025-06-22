
-- Add new columns to clients table for portal access
ALTER TABLE public.clients 
ADD COLUMN client_id TEXT UNIQUE,
ADD COLUMN client_password TEXT,
ADD COLUMN is_portal_enabled BOOLEAN DEFAULT false;

-- Create index on client_id for faster lookups
CREATE INDEX idx_clients_client_id ON public.clients(client_id);

-- Create client_sessions table for portal session management
CREATE TABLE public.client_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id TEXT NOT NULL REFERENCES public.clients(client_id) ON DELETE CASCADE,
  session_token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on session_token for faster lookups
CREATE INDEX idx_client_sessions_token ON public.client_sessions(session_token);
CREATE INDEX idx_client_sessions_expires ON public.client_sessions(expires_at);

-- Function to generate unique client ID
CREATE OR REPLACE FUNCTION generate_client_id()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  new_id TEXT;
  exists_check INTEGER;
BEGIN
  LOOP
    -- Generate 8-character alphanumeric ID
    new_id := upper(substring(md5(random()::text) from 1 for 8));
    
    -- Check if ID already exists
    SELECT COUNT(*) INTO exists_check FROM public.clients WHERE client_id = new_id;
    
    -- Exit loop if ID is unique
    EXIT WHEN exists_check = 0;
  END LOOP;
  
  RETURN new_id;
END;
$$;

-- Function to generate secure password
CREATE OR REPLACE FUNCTION generate_client_password()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  password TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..10 LOOP
    password := password || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  
  RETURN password;
END;
$$;

-- Enable RLS on client_sessions
ALTER TABLE public.client_sessions ENABLE ROW LEVEL SECURITY;

-- Policy for client_sessions - clients can only access their own sessions
CREATE POLICY "Clients can access own sessions" ON public.client_sessions
  FOR ALL USING (
    client_id IN (
      SELECT c.client_id FROM public.clients c 
      WHERE c.salon_id = auth.uid()
    )
  );
