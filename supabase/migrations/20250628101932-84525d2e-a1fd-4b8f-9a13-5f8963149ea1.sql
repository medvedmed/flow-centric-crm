
-- Create payment_methods table
CREATE TABLE public.payment_methods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  salon_id UUID NOT NULL REFERENCES auth.users(id),
  name TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'credit-card',
  color TEXT NOT NULL DEFAULT 'blue',
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;

-- Create policies for payment_methods
CREATE POLICY "Users can view their own payment methods" 
  ON public.payment_methods 
  FOR SELECT 
  USING (auth.uid() = salon_id);

CREATE POLICY "Users can create their own payment methods" 
  ON public.payment_methods 
  FOR INSERT 
  WITH CHECK (auth.uid() = salon_id);

CREATE POLICY "Users can update their own payment methods" 
  ON public.payment_methods 
  FOR UPDATE 
  USING (auth.uid() = salon_id);

CREATE POLICY "Users can delete their own payment methods" 
  ON public.payment_methods 
  FOR DELETE 
  USING (auth.uid() = salon_id);

-- Insert default payment methods for existing users
INSERT INTO public.payment_methods (salon_id, name, icon, color, is_default)
SELECT 
  id as salon_id,
  'Cash' as name,
  'banknote' as icon,
  'emerald' as color,
  true as is_default
FROM auth.users
WHERE id IN (SELECT DISTINCT salon_id FROM public.appointments WHERE salon_id IS NOT NULL);

INSERT INTO public.payment_methods (salon_id, name, icon, color)
SELECT 
  id as salon_id,
  'Credit Card' as name,
  'credit-card' as icon,
  'blue' as color
FROM auth.users
WHERE id IN (SELECT DISTINCT salon_id FROM public.appointments WHERE salon_id IS NOT NULL);

INSERT INTO public.payment_methods (salon_id, name, icon, color)  
SELECT 
  id as salon_id,
  'Bank Transfer' as name,
  'building' as icon,
  'violet' as color
FROM auth.users
WHERE id IN (SELECT DISTINCT salon_id FROM public.appointments WHERE salon_id IS NOT NULL);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION public.update_payment_methods_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_payment_methods_updated_at
    BEFORE UPDATE ON public.payment_methods
    FOR EACH ROW
    EXECUTE FUNCTION public.update_payment_methods_updated_at();
