-- Add RLS policies for tables missing them

-- appointment_products RLS policies
ALTER TABLE public.appointment_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view appointment products for their org appointments"
ON public.appointment_products
FOR SELECT
USING (
  appointment_id IN (
    SELECT id FROM public.appointments WHERE organization_id = get_user_org_id(auth.uid())
  )
);

CREATE POLICY "Users can create appointment products for their org appointments"
ON public.appointment_products
FOR INSERT
WITH CHECK (
  appointment_id IN (
    SELECT id FROM public.appointments WHERE organization_id = get_user_org_id(auth.uid())
  )
);

CREATE POLICY "Users can update appointment products for their org appointments"
ON public.appointment_products
FOR UPDATE
USING (
  appointment_id IN (
    SELECT id FROM public.appointments WHERE organization_id = get_user_org_id(auth.uid())
  )
);

CREATE POLICY "Users can delete appointment products for their org appointments"
ON public.appointment_products
FOR DELETE
USING (
  appointment_id IN (
    SELECT id FROM public.appointments WHERE organization_id = get_user_org_id(auth.uid())
  )
);

-- appointment_services RLS policies
ALTER TABLE public.appointment_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view appointment services for their org appointments"
ON public.appointment_services
FOR SELECT
USING (
  appointment_id IN (
    SELECT id FROM public.appointments WHERE organization_id = get_user_org_id(auth.uid())
  )
);

CREATE POLICY "Users can create appointment services for their org appointments"
ON public.appointment_services
FOR INSERT
WITH CHECK (
  appointment_id IN (
    SELECT id FROM public.appointments WHERE organization_id = get_user_org_id(auth.uid())
  )
);

CREATE POLICY "Users can update appointment services for their org appointments"
ON public.appointment_services
FOR UPDATE
USING (
  appointment_id IN (
    SELECT id FROM public.appointments WHERE organization_id = get_user_org_id(auth.uid())
  )
);

CREATE POLICY "Users can delete appointment services for their org appointments"
ON public.appointment_services
FOR DELETE
USING (
  appointment_id IN (
    SELECT id FROM public.appointments WHERE organization_id = get_user_org_id(auth.uid())
  )
);

-- appointment_reminders RLS policies
ALTER TABLE public.appointment_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Salon owners can manage their reminders"
ON public.appointment_reminders
FOR ALL
USING (salon_id = auth.uid());

-- product_sales RLS policies
ALTER TABLE public.product_sales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their salon product sales"
ON public.product_sales
FOR SELECT
USING (salon_id = auth.uid());

CREATE POLICY "Users can create product sales for their salon"
ON public.product_sales
FOR INSERT
WITH CHECK (salon_id = auth.uid());

CREATE POLICY "Users can update their salon product sales"
ON public.product_sales
FOR UPDATE
USING (salon_id = auth.uid());

CREATE POLICY "Users can delete their salon product sales"
ON public.product_sales
FOR DELETE
USING (salon_id = auth.uid());

-- client_sessions - allow session management
ALTER TABLE public.client_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow session management"
ON public.client_sessions
FOR ALL
USING (true)
WITH CHECK (true);