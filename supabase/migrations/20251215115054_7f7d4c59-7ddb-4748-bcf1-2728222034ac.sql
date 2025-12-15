
-- Fix infinite recursion in RLS policies by using security definer functions

-- 1. Create a function to get user's organization_id without triggering RLS
CREATE OR REPLACE FUNCTION public.get_user_org_id(user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT organization_id FROM public.profiles WHERE id = user_id LIMIT 1;
$$;

-- 2. Create a function to check user's role without triggering RLS
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = user_id LIMIT 1;
$$;

-- 3. Create a helper function to check if user has specific role
CREATE OR REPLACE FUNCTION public.user_has_role(user_id uuid, allowed_roles text[])
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id AND role = ANY(allowed_roles)
  );
$$;

-- 4. Drop existing problematic profiles policies
DROP POLICY IF EXISTS "Admins can manage org profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view org profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view org members" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- 5. Create new non-recursive profiles policies
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
USING (id = auth.uid());

CREATE POLICY "Users can view org profiles"
ON public.profiles FOR SELECT
USING (organization_id = public.get_user_org_id(auth.uid()));

CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT
WITH CHECK (id = auth.uid());

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

CREATE POLICY "Admins can manage org profiles"
ON public.profiles FOR ALL
USING (
  public.get_user_role(auth.uid()) = 'admin' 
  AND organization_id = public.get_user_org_id(auth.uid())
);

-- 6. Drop and recreate appointments policies to avoid recursion
DROP POLICY IF EXISTS "Users can view org appointments" ON public.appointments;
DROP POLICY IF EXISTS "Staff can view own appointments" ON public.appointments;
DROP POLICY IF EXISTS "Staff can create appointments" ON public.appointments;
DROP POLICY IF EXISTS "Staff can update own appointments" ON public.appointments;
DROP POLICY IF EXISTS "Admins can delete appointments" ON public.appointments;

CREATE POLICY "Users can view org appointments"
ON public.appointments FOR SELECT
USING (organization_id = public.get_user_org_id(auth.uid()));

CREATE POLICY "Staff can view own appointments"
ON public.appointments FOR SELECT
USING (staff_id = auth.uid());

CREATE POLICY "Staff can create appointments"
ON public.appointments FOR INSERT
WITH CHECK (organization_id = public.get_user_org_id(auth.uid()));

CREATE POLICY "Staff can update appointments"
ON public.appointments FOR UPDATE
USING (organization_id = public.get_user_org_id(auth.uid()));

CREATE POLICY "Admins can delete appointments"
ON public.appointments FOR DELETE
USING (
  public.user_has_role(auth.uid(), ARRAY['admin', 'receptionist'])
  AND organization_id = public.get_user_org_id(auth.uid())
);

-- 7. Fix clients policies
DROP POLICY IF EXISTS "Users can view org clients" ON public.clients;
DROP POLICY IF EXISTS "Staff can create clients" ON public.clients;
DROP POLICY IF EXISTS "Staff can update clients" ON public.clients;
DROP POLICY IF EXISTS "Admins can delete clients" ON public.clients;

CREATE POLICY "Users can view org clients"
ON public.clients FOR SELECT
USING (organization_id = public.get_user_org_id(auth.uid()));

CREATE POLICY "Staff can create clients"
ON public.clients FOR INSERT
WITH CHECK (organization_id = public.get_user_org_id(auth.uid()));

CREATE POLICY "Staff can update clients"
ON public.clients FOR UPDATE
USING (organization_id = public.get_user_org_id(auth.uid()));

CREATE POLICY "Admins can delete clients"
ON public.clients FOR DELETE
USING (
  public.get_user_role(auth.uid()) = 'admin'
  AND organization_id = public.get_user_org_id(auth.uid())
);

-- 8. Fix services policies
DROP POLICY IF EXISTS "Users can view org services" ON public.services;
DROP POLICY IF EXISTS "Admins can manage services" ON public.services;

CREATE POLICY "Users can view org services"
ON public.services FOR SELECT
USING (organization_id = public.get_user_org_id(auth.uid()));

CREATE POLICY "Admins can manage services"
ON public.services FOR ALL
USING (
  public.get_user_role(auth.uid()) = 'admin'
  AND organization_id = public.get_user_org_id(auth.uid())
);

-- 9. Fix products policies
DROP POLICY IF EXISTS "Users can view org products" ON public.products;
DROP POLICY IF EXISTS "Staff can manage products" ON public.products;

CREATE POLICY "Users can view org products"
ON public.products FOR SELECT
USING (organization_id = public.get_user_org_id(auth.uid()));

CREATE POLICY "Staff can manage products"
ON public.products FOR ALL
USING (
  public.user_has_role(auth.uid(), ARRAY['admin', 'staff'])
  AND organization_id = public.get_user_org_id(auth.uid())
);

-- 10. Fix transactions policies
DROP POLICY IF EXISTS "Users can view transaction items" ON public.transaction_items;
DROP POLICY IF EXISTS "Staff can create transaction items" ON public.transaction_items;
DROP POLICY IF EXISTS "Admins can manage transaction items" ON public.transaction_items;

CREATE POLICY "Users can view transaction items"
ON public.transaction_items FOR SELECT
USING (
  transaction_id IN (
    SELECT id FROM public.transactions 
    WHERE organization_id = public.get_user_org_id(auth.uid())
  )
);

CREATE POLICY "Staff can create transaction items"
ON public.transaction_items FOR INSERT
WITH CHECK (
  transaction_id IN (
    SELECT id FROM public.transactions 
    WHERE organization_id = public.get_user_org_id(auth.uid())
  )
);

CREATE POLICY "Admins can manage transaction items"
ON public.transaction_items FOR ALL
USING (
  public.get_user_role(auth.uid()) = 'admin'
  AND transaction_id IN (
    SELECT id FROM public.transactions 
    WHERE organization_id = public.get_user_org_id(auth.uid())
  )
);

-- 11. Fix transactions table policies
DROP POLICY IF EXISTS "Admins can manage transactions" ON public.transactions;

CREATE POLICY "Admins can manage transactions"
ON public.transactions FOR ALL
USING (
  public.get_user_role(auth.uid()) = 'admin'
  AND organization_id = public.get_user_org_id(auth.uid())
);

-- 12. Fix staff_schedules policies
DROP POLICY IF EXISTS "Users can view org schedules" ON public.staff_schedules;
DROP POLICY IF EXISTS "Staff can view own schedule" ON public.staff_schedules;
DROP POLICY IF EXISTS "Admins can manage schedules" ON public.staff_schedules;

CREATE POLICY "Users can view org schedules"
ON public.staff_schedules FOR SELECT
USING (organization_id = public.get_user_org_id(auth.uid()));

CREATE POLICY "Staff can view own schedule"
ON public.staff_schedules FOR SELECT
USING (staff_id = auth.uid());

CREATE POLICY "Admins can manage schedules"
ON public.staff_schedules FOR ALL
USING (
  public.get_user_role(auth.uid()) = 'admin'
  AND organization_id = public.get_user_org_id(auth.uid())
);

-- 13. Fix organizations policies
DROP POLICY IF EXISTS "Users can view own organization" ON public.organizations;
DROP POLICY IF EXISTS "Admins can update organization" ON public.organizations;

CREATE POLICY "Users can view own organization"
ON public.organizations FOR SELECT
USING (id = public.get_user_org_id(auth.uid()));

CREATE POLICY "Admins can update organization"
ON public.organizations FOR UPDATE
USING (
  public.get_user_role(auth.uid()) = 'admin'
  AND id = public.get_user_org_id(auth.uid())
);

-- Allow insert for organizations (needed for new user signup)
CREATE POLICY "Users can create organization"
ON public.organizations FOR INSERT
WITH CHECK (true);
