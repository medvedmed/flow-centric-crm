
-- Add a staff_code field to the staff table for alternative login
ALTER TABLE public.staff ADD COLUMN staff_code TEXT UNIQUE;

-- Create function to generate random staff codes
CREATE OR REPLACE FUNCTION public.generate_staff_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  code TEXT;
  exists_check INTEGER;
BEGIN
  LOOP
    -- Generate a 6-character alphanumeric code
    code := upper(substring(md5(random()::text) from 1 for 6));
    
    -- Check if code already exists
    SELECT COUNT(*) INTO exists_check FROM public.staff WHERE staff_code = code;
    
    -- Exit loop if code is unique
    EXIT WHEN exists_check = 0;
  END LOOP;
  
  RETURN code;
END;
$$;

-- Create function to auto-assign staff role based on email
CREATE OR REPLACE FUNCTION public.assign_staff_role_by_email()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  staff_record RECORD;
  salon_owner_id UUID;
BEGIN
  -- Check if the user's email exists in the staff table
  SELECT * INTO staff_record FROM public.staff WHERE email = NEW.email;
  
  IF FOUND THEN
    -- Get the salon_id (which is the salon owner's user id)
    salon_owner_id := staff_record.salon_id;
    
    -- Insert user role as staff for this salon
    INSERT INTO public.user_roles (user_id, salon_id, role, is_active)
    VALUES (NEW.id, salon_owner_id, 'staff', TRUE)
    ON CONFLICT (user_id, salon_id) DO UPDATE SET
      role = 'staff',
      is_active = TRUE,
      updated_at = NOW();
      
    -- Update the staff record to link it to the user
    UPDATE public.staff 
    SET updated_at = NOW()
    WHERE id = staff_record.id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to auto-assign staff role on user creation
CREATE TRIGGER on_auth_user_created_assign_staff_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.assign_staff_role_by_email();

-- Update existing staff records to have staff codes
UPDATE public.staff 
SET staff_code = public.generate_staff_code() 
WHERE staff_code IS NULL;

-- Create function to find user by staff code
CREATE OR REPLACE FUNCTION public.get_user_by_staff_code(code TEXT)
RETURNS TABLE(user_id UUID, email TEXT, salon_id UUID)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT ur.user_id, p.email, ur.salon_id
  FROM public.staff s
  JOIN public.user_roles ur ON s.salon_id = ur.salon_id
  JOIN auth.users au ON ur.user_id = au.id
  JOIN public.profiles p ON au.id = p.id
  WHERE s.staff_code = code AND ur.role = 'staff' AND ur.is_active = TRUE;
$$;
