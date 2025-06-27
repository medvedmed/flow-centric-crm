
-- Fix RLS policies for WhatsApp automation settings to ensure proper access control
DROP POLICY IF EXISTS "Users can view their own automation settings" ON public.whatsapp_automation_settings;
CREATE POLICY "Users can manage their own automation settings" 
  ON public.whatsapp_automation_settings 
  FOR ALL 
  USING (salon_id = auth.uid());

-- Add debugging function to check automation settings access
CREATE OR REPLACE FUNCTION public.debug_automation_settings_access(target_salon_id uuid)
RETURNS TABLE(
  can_select boolean,
  can_insert boolean,
  can_update boolean,
  current_user_id uuid,
  settings_count integer
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    EXISTS(SELECT 1 FROM public.whatsapp_automation_settings WHERE salon_id = target_salon_id) as can_select,
    true as can_insert,
    true as can_update,
    auth.uid() as current_user_id,
    (SELECT COUNT(*)::integer FROM public.whatsapp_automation_settings WHERE salon_id = target_salon_id) as settings_count;
END;
$$;

-- Ensure the table has proper defaults for upsert operations
ALTER TABLE public.whatsapp_automation_settings 
ALTER COLUMN is_enabled SET DEFAULT true,
ALTER COLUMN reminder_24h_enabled SET DEFAULT true,
ALTER COLUMN reminder_2h_enabled SET DEFAULT false,
ALTER COLUMN reminder_1h_enabled SET DEFAULT false,
ALTER COLUMN follow_up_enabled SET DEFAULT false,
ALTER COLUMN follow_up_delay_hours SET DEFAULT 2;
