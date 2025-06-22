
-- Create enum for application roles
CREATE TYPE public.app_role AS ENUM ('salon_owner', 'manager', 'staff', 'receptionist');

-- Create enum for permission areas
CREATE TYPE public.permission_area AS ENUM (
  'dashboard', 
  'appointments', 
  'clients', 
  'staff_management', 
  'services', 
  'inventory', 
  'reports', 
  'settings',
  'schedule_management',
  'time_off_requests'
);

-- Create user roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  salon_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'staff',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, salon_id)
);

-- Create role permissions table
CREATE TABLE public.role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  area permission_area NOT NULL,
  can_view BOOLEAN DEFAULT FALSE,
  can_create BOOLEAN DEFAULT FALSE,
  can_edit BOOLEAN DEFAULT FALSE,
  can_delete BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(salon_id, role, area)
);

-- Enable RLS for user roles and permissions
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- Create security definer function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID, salon_id UUID)
RETURNS app_role
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM public.user_roles 
  WHERE user_roles.user_id = get_user_role.user_id 
    AND user_roles.salon_id = get_user_role.salon_id 
    AND is_active = TRUE;
$$;

-- Create security definer function to check permissions
CREATE OR REPLACE FUNCTION public.has_permission(
  user_id UUID, 
  salon_id UUID, 
  area permission_area, 
  action TEXT
)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT CASE 
    WHEN action = 'view' THEN COALESCE(rp.can_view, FALSE)
    WHEN action = 'create' THEN COALESCE(rp.can_create, FALSE)
    WHEN action = 'edit' THEN COALESCE(rp.can_edit, FALSE)
    WHEN action = 'delete' THEN COALESCE(rp.can_delete, FALSE)
    ELSE FALSE
  END
  FROM public.user_roles ur
  LEFT JOIN public.role_permissions rp ON (
    ur.role = rp.role 
    AND ur.salon_id = rp.salon_id 
    AND rp.area = has_permission.area
  )
  WHERE ur.user_id = has_permission.user_id 
    AND ur.salon_id = has_permission.salon_id 
    AND ur.is_active = TRUE;
$$;

-- RLS policies for user_roles
CREATE POLICY "Salon owners and managers can view roles" 
  ON public.user_roles 
  FOR SELECT 
  USING (
    salon_id = auth.uid() OR 
    public.get_user_role(auth.uid(), salon_id) IN ('salon_owner', 'manager')
  );

CREATE POLICY "Salon owners can manage all roles" 
  ON public.user_roles 
  FOR ALL 
  USING (salon_id = auth.uid());

CREATE POLICY "Managers can manage staff roles" 
  ON public.user_roles 
  FOR ALL 
  USING (
    public.get_user_role(auth.uid(), salon_id) = 'manager' 
    AND role IN ('staff', 'receptionist')
  );

-- RLS policies for role_permissions
CREATE POLICY "Salon owners can view all permissions" 
  ON public.role_permissions 
  FOR SELECT 
  USING (salon_id = auth.uid());

CREATE POLICY "Salon owners can manage all permissions" 
  ON public.role_permissions 
  FOR ALL 
  USING (salon_id = auth.uid());

-- Insert default permissions for salon owners
INSERT INTO public.role_permissions (salon_id, role, area, can_view, can_create, can_edit, can_delete)
SELECT 
  p.id as salon_id,
  'salon_owner'::app_role,
  area_enum.area,
  TRUE, TRUE, TRUE, TRUE
FROM public.profiles p
CROSS JOIN (
  SELECT unnest(enum_range(NULL::permission_area)) AS area
) area_enum
ON CONFLICT (salon_id, role, area) DO NOTHING;

-- Insert default permissions for managers
INSERT INTO public.role_permissions (salon_id, role, area, can_view, can_create, can_edit, can_delete)
SELECT 
  p.id as salon_id,
  'manager'::app_role,
  area_enum.area,
  CASE 
    WHEN area_enum.area IN ('settings') THEN FALSE
    ELSE TRUE
  END,
  CASE 
    WHEN area_enum.area IN ('settings') THEN FALSE
    ELSE TRUE
  END,
  CASE 
    WHEN area_enum.area IN ('settings') THEN FALSE
    ELSE TRUE
  END,
  CASE 
    WHEN area_enum.area IN ('settings', 'staff_management') THEN FALSE
    ELSE TRUE
  END
FROM public.profiles p
CROSS JOIN (
  SELECT unnest(enum_range(NULL::permission_area)) AS area
) area_enum
ON CONFLICT (salon_id, role, area) DO NOTHING;

-- Insert default permissions for staff
INSERT INTO public.role_permissions (salon_id, role, area, can_view, can_create, can_edit, can_delete)
SELECT 
  p.id as salon_id,
  'staff'::app_role,
  area_enum.area,
  CASE 
    WHEN area_enum.area IN ('dashboard', 'appointments', 'clients', 'services', 'time_off_requests') THEN TRUE
    ELSE FALSE
  END,
  CASE 
    WHEN area_enum.area IN ('time_off_requests') THEN TRUE
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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_roles_user_salon ON public.user_roles(user_id, salon_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_salon_role ON public.user_roles(salon_id, role);
CREATE INDEX IF NOT EXISTS idx_role_permissions_salon_role_area ON public.role_permissions(salon_id, role, area);

-- Add updated_at triggers
CREATE TRIGGER update_user_roles_updated_at 
  BEFORE UPDATE ON public.user_roles 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_role_permissions_updated_at 
  BEFORE UPDATE ON public.role_permissions 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
