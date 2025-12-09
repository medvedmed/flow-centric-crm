-- Enable pgcrypto extension for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create a function to hash passwords
CREATE OR REPLACE FUNCTION public.hash_password(password text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN crypt(password, gen_salt('bf', 10));
END;
$$;

-- Create a function to verify passwords
CREATE OR REPLACE FUNCTION public.verify_password(password text, hashed_password text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN hashed_password = crypt(password, hashed_password);
END;
$$;

-- Update the authenticate_staff function to use password hashing and not leak data
CREATE OR REPLACE FUNCTION public.authenticate_staff(login_id text, login_password text)
RETURNS TABLE(staff_id uuid, staff_name text, staff_email text, salon_id uuid, is_valid boolean)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  staff_record RECORD;
  password_valid boolean := false;
BEGIN
  -- Find staff by login_id
  SELECT s.id, s.name, s.email, s.salon_id, s.staff_login_password, s.status
  INTO staff_record
  FROM public.staff s
  WHERE s.staff_login_id = login_id
  LIMIT 1;
  
  -- If no staff found, return invalid without leaking info
  IF NOT FOUND THEN
    RETURN QUERY SELECT 
      NULL::uuid as staff_id,
      NULL::text as staff_name,
      NULL::text as staff_email,
      NULL::uuid as salon_id,
      false as is_valid;
    RETURN;
  END IF;
  
  -- Check if password starts with '$2' (bcrypt hash prefix)
  IF staff_record.staff_login_password LIKE '$2%' THEN
    -- Verify hashed password
    password_valid := public.verify_password(login_password, staff_record.staff_login_password);
  ELSE
    -- Legacy plaintext comparison (for migration period)
    password_valid := (staff_record.staff_login_password = login_password);
  END IF;
  
  -- Only return data if password is valid AND status is active
  IF password_valid AND staff_record.status = 'active' THEN
    RETURN QUERY SELECT 
      staff_record.id,
      staff_record.name,
      staff_record.email,
      staff_record.salon_id,
      true as is_valid;
  ELSE
    -- Return null data for invalid credentials (don't leak existence)
    RETURN QUERY SELECT 
      NULL::uuid as staff_id,
      NULL::text as staff_name,
      NULL::text as staff_email,
      NULL::uuid as salon_id,
      false as is_valid;
  END IF;
END;
$$;

-- Update generate_staff_login_password to return hashed passwords
CREATE OR REPLACE FUNCTION public.generate_staff_login_password()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  raw_password TEXT := '';
  i INTEGER;
BEGIN
  -- Generate 10-character random password
  FOR i IN 1..10 LOOP
    raw_password := raw_password || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  
  -- Return the raw password (will be hashed when stored, but we need to show it to user once)
  RETURN raw_password;
END;
$$;

-- Create a function to hash and update a staff password
CREATE OR REPLACE FUNCTION public.set_staff_password(target_staff_id uuid, new_password text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.staff 
  SET staff_login_password = public.hash_password(new_password),
      updated_at = now()
  WHERE id = target_staff_id;
  
  RETURN FOUND;
END;
$$;

-- Create trigger to auto-hash passwords on insert/update
CREATE OR REPLACE FUNCTION public.hash_staff_password_trigger()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Only hash if password is being set and isn't already hashed
  IF NEW.staff_login_password IS NOT NULL AND NEW.staff_login_password NOT LIKE '$2%' THEN
    NEW.staff_login_password := public.hash_password(NEW.staff_login_password);
  END IF;
  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists and create new one
DROP TRIGGER IF EXISTS hash_staff_password ON public.staff;
CREATE TRIGGER hash_staff_password
  BEFORE INSERT OR UPDATE OF staff_login_password ON public.staff
  FOR EACH ROW
  EXECUTE FUNCTION public.hash_staff_password_trigger();