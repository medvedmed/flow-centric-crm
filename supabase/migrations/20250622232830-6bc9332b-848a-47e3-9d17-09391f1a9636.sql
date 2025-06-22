
-- Add staff_id and staff_password columns to the staff table
ALTER TABLE public.staff 
ADD COLUMN staff_login_id TEXT,
ADD COLUMN staff_login_password TEXT;

-- Update the generate_staff_code function to generate login credentials
CREATE OR REPLACE FUNCTION public.generate_staff_login_id()
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
    SELECT COUNT(*) INTO exists_check FROM public.staff WHERE staff_login_id = new_id;
    
    -- Exit loop if ID is unique
    EXIT WHEN exists_check = 0;
  END LOOP;
  
  RETURN new_id;
END;
$$;

-- Function to generate staff login password
CREATE OR REPLACE FUNCTION public.generate_staff_login_password()
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

-- Create trigger to auto-generate staff credentials when staff is created
CREATE OR REPLACE FUNCTION public.auto_generate_staff_credentials()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.staff_login_id IS NULL THEN
    NEW.staff_login_id := generate_staff_login_id();
  END IF;
  
  IF NEW.staff_login_password IS NULL THEN
    NEW.staff_login_password := generate_staff_login_password();
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for staff credentials generation
DROP TRIGGER IF EXISTS trigger_generate_staff_credentials ON public.staff;
CREATE TRIGGER trigger_generate_staff_credentials
  BEFORE INSERT ON public.staff
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_staff_credentials();

-- Function to authenticate staff by login ID and password
CREATE OR REPLACE FUNCTION public.authenticate_staff(login_id TEXT, login_password TEXT)
RETURNS TABLE(
  staff_id UUID,
  staff_name TEXT,
  staff_email TEXT,
  salon_id UUID,
  is_valid BOOLEAN
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    s.id,
    s.name,
    s.email,
    s.salon_id,
    (s.staff_login_id = login_id AND s.staff_login_password = login_password AND s.status = 'active') as is_valid
  FROM public.staff s
  WHERE s.staff_login_id = login_id
  LIMIT 1;
$$;
