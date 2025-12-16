-- Fix user's role to admin so they can manage everything
UPDATE profiles 
SET role = 'admin' 
WHERE id = '4d609b35-4370-4f30-99be-33424ffe4bde';

-- Drop and recreate staff RLS policies to use get_user_org_id
DROP POLICY IF EXISTS "Users can view their salon staff" ON staff;
DROP POLICY IF EXISTS "Users can create staff for their salon" ON staff;
DROP POLICY IF EXISTS "Users can update their salon staff" ON staff;
DROP POLICY IF EXISTS "Users can delete their salon staff" ON staff;
DROP POLICY IF EXISTS "Salon owners can manage their staff" ON staff;
DROP POLICY IF EXISTS "Allow Owners to create staff" ON staff;

CREATE POLICY "Users can view their salon staff"
ON staff FOR SELECT
USING (salon_id = auth.uid() OR salon_id = get_user_org_id(auth.uid()));

CREATE POLICY "Users can create staff for their salon"
ON staff FOR INSERT
WITH CHECK (salon_id = auth.uid() OR salon_id = get_user_org_id(auth.uid()));

CREATE POLICY "Users can update their salon staff"
ON staff FOR UPDATE
USING (salon_id = auth.uid() OR salon_id = get_user_org_id(auth.uid()));

CREATE POLICY "Users can delete their salon staff"
ON staff FOR DELETE
USING (salon_id = auth.uid() OR salon_id = get_user_org_id(auth.uid()));

-- Fix services RLS policies
DROP POLICY IF EXISTS "Allow Owners to manage services" ON services;
DROP POLICY IF EXISTS "Admins can manage services" ON services;
DROP POLICY IF EXISTS "Users can view org services" ON services;

CREATE POLICY "Users can view org services"
ON services FOR SELECT
USING (organization_id = auth.uid() OR organization_id = get_user_org_id(auth.uid()));

CREATE POLICY "Users can manage services"
ON services FOR ALL
USING (organization_id = auth.uid() OR organization_id = get_user_org_id(auth.uid()))
WITH CHECK (organization_id = auth.uid() OR organization_id = get_user_org_id(auth.uid()));

-- Fix products RLS policies
DROP POLICY IF EXISTS "Allow Owners to manage products" ON products;
DROP POLICY IF EXISTS "Staff can manage products" ON products;
DROP POLICY IF EXISTS "Users can view org products" ON products;

CREATE POLICY "Users can view org products"
ON products FOR SELECT
USING (organization_id = auth.uid() OR organization_id = get_user_org_id(auth.uid()));

CREATE POLICY "Users can manage products"
ON products FOR ALL
USING (organization_id = auth.uid() OR organization_id = get_user_org_id(auth.uid()))
WITH CHECK (organization_id = auth.uid() OR organization_id = get_user_org_id(auth.uid()));

-- Fix inventory_items RLS policies  
DROP POLICY IF EXISTS "Users can view their salon's inventory" ON inventory_items;
DROP POLICY IF EXISTS "Users can create inventory for their salon" ON inventory_items;
DROP POLICY IF EXISTS "Users can update their salon's inventory" ON inventory_items;
DROP POLICY IF EXISTS "Users can delete their salon's inventory" ON inventory_items;

CREATE POLICY "Users can view their salon inventory"
ON inventory_items FOR SELECT
USING (salon_id = auth.uid() OR salon_id = get_user_org_id(auth.uid()));

CREATE POLICY "Users can create inventory for their salon"
ON inventory_items FOR INSERT
WITH CHECK (salon_id = auth.uid() OR salon_id = get_user_org_id(auth.uid()));

CREATE POLICY "Users can update their salon inventory"
ON inventory_items FOR UPDATE
USING (salon_id = auth.uid() OR salon_id = get_user_org_id(auth.uid()));

CREATE POLICY "Users can delete their salon inventory"
ON inventory_items FOR DELETE
USING (salon_id = auth.uid() OR salon_id = get_user_org_id(auth.uid()));

-- Fix staff_availability RLS
DROP POLICY IF EXISTS "Salon owners can view their staff availability" ON staff_availability;
DROP POLICY IF EXISTS "Salon owners can create staff availability for their staff" ON staff_availability;
DROP POLICY IF EXISTS "Salon owners can update their staff availability" ON staff_availability;
DROP POLICY IF EXISTS "Salon owners can delete their staff availability" ON staff_availability;

CREATE POLICY "Users can view staff availability"
ON staff_availability FOR SELECT
USING (salon_id = auth.uid() OR salon_id = get_user_org_id(auth.uid()));

CREATE POLICY "Users can create staff availability"
ON staff_availability FOR INSERT
WITH CHECK (salon_id = auth.uid() OR salon_id = get_user_org_id(auth.uid()));

CREATE POLICY "Users can update staff availability"
ON staff_availability FOR UPDATE
USING (salon_id = auth.uid() OR salon_id = get_user_org_id(auth.uid()));

CREATE POLICY "Users can delete staff availability"
ON staff_availability FOR DELETE
USING (salon_id = auth.uid() OR salon_id = get_user_org_id(auth.uid()));

-- Fix time_off_requests RLS
DROP POLICY IF EXISTS "Salon owners can view their staff time-off requests" ON time_off_requests;
DROP POLICY IF EXISTS "Salon owners can create time-off requests for their staff" ON time_off_requests;
DROP POLICY IF EXISTS "Salon owners can update their staff time-off requests" ON time_off_requests;
DROP POLICY IF EXISTS "Salon owners can delete their staff time-off requests" ON time_off_requests;

CREATE POLICY "Users can view time-off requests"
ON time_off_requests FOR SELECT
USING (salon_id = auth.uid() OR salon_id = get_user_org_id(auth.uid()));

CREATE POLICY "Users can create time-off requests"
ON time_off_requests FOR INSERT
WITH CHECK (salon_id = auth.uid() OR salon_id = get_user_org_id(auth.uid()));

CREATE POLICY "Users can update time-off requests"
ON time_off_requests FOR UPDATE
USING (salon_id = auth.uid() OR salon_id = get_user_org_id(auth.uid()));

CREATE POLICY "Users can delete time-off requests"
ON time_off_requests FOR DELETE
USING (salon_id = auth.uid() OR salon_id = get_user_org_id(auth.uid()));