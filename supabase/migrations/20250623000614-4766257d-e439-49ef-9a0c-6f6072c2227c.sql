
-- First, let's get your user ID from the profiles table and set up the roles
-- We'll use your profile record to establish the proper user role setup

WITH user_info AS (
  SELECT id FROM public.profiles WHERE email = (
    SELECT email FROM auth.users ORDER BY created_at DESC LIMIT 1
  )
)
INSERT INTO public.user_roles (user_id, salon_id, role, is_active)
SELECT id, id, 'salon_owner'::app_role, TRUE
FROM user_info
ON CONFLICT (user_id, salon_id) DO UPDATE SET
  role = 'salon_owner',
  is_active = TRUE,
  updated_at = NOW();

-- Set up all permissions for the salon owner role using the same user ID
WITH user_info AS (
  SELECT id FROM public.profiles WHERE email = (
    SELECT email FROM auth.users ORDER BY created_at DESC LIMIT 1
  )
)
INSERT INTO public.role_permissions (salon_id, role, area, can_view, can_create, can_edit, can_delete)
SELECT 
  ui.id as salon_id,
  'salon_owner'::app_role,
  area_enum.area,
  TRUE, TRUE, TRUE, TRUE
FROM user_info ui
CROSS JOIN (
  SELECT unnest(enum_range(NULL::permission_area)) AS area
) area_enum
ON CONFLICT (salon_id, role, area) DO UPDATE SET
  can_view = TRUE,
  can_create = TRUE,
  can_edit = TRUE,
  can_delete = TRUE,
  updated_at = NOW();

-- Update the profile role to salon_owner
UPDATE public.profiles 
SET role = 'salon_owner'
WHERE email = (
  SELECT email FROM auth.users ORDER BY created_at DESC LIMIT 1
);
