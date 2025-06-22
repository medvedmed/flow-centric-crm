
-- First, let's check and fix the assign_staff_role_by_email trigger function
CREATE OR REPLACE FUNCTION public.assign_staff_role_by_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
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
    
    -- Also ensure the user gets a profile record with the correct role
    UPDATE public.profiles 
    SET role = 'staff'
    WHERE id = NEW.id;
  ELSE
    -- If not found in staff table, this is likely a salon owner
    -- Ensure they get salon_owner role in profiles
    UPDATE public.profiles 
    SET role = 'salon_owner'
    WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Make sure the trigger exists and is properly attached
DROP TRIGGER IF EXISTS on_auth_user_created_assign_staff_role ON auth.users;
CREATE TRIGGER on_auth_user_created_assign_staff_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.assign_staff_role_by_email();

-- Insert default permissions for receptionist role (in case we need it later)
INSERT INTO public.role_permissions (salon_id, role, area, can_view, can_create, can_edit, can_delete)
SELECT 
  p.id as salon_id,
  'receptionist'::app_role,
  area_enum.area,
  CASE 
    WHEN area_enum.area IN ('dashboard', 'appointments', 'clients') THEN TRUE
    ELSE FALSE
  END,
  CASE 
    WHEN area_enum.area IN ('appointments', 'clients') THEN TRUE
    ELSE FALSE
  END,
  CASE 
    WHEN area_enum.area IN ('appointments', 'clients') THEN TRUE
    ELSE FALSE
  END,
  FALSE
FROM public.profiles p
CROSS JOIN (
  SELECT unnest(enum_range(NULL::permission_area)) AS area
) area_enum
ON CONFLICT (salon_id, role, area) DO NOTHING;
