
-- Create services table with proper structure
CREATE TABLE public.services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  salon_id UUID NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'General',
  duration INTEGER NOT NULL DEFAULT 60,
  price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  popular BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Create policies for services table
CREATE POLICY "Users can view services for their salon" 
  ON public.services 
  FOR SELECT 
  USING (salon_id = auth.uid());

CREATE POLICY "Users can create services for their salon" 
  ON public.services 
  FOR INSERT 
  WITH CHECK (salon_id = auth.uid());

CREATE POLICY "Users can update services for their salon" 
  ON public.services 
  FOR UPDATE 
  USING (salon_id = auth.uid());

CREATE POLICY "Users can delete services for their salon" 
  ON public.services 
  FOR DELETE 
  USING (salon_id = auth.uid());

-- Add trigger to update updated_at column
CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON public.services
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_services_salon_id ON public.services(salon_id);
CREATE INDEX idx_services_category ON public.services(category);
CREATE INDEX idx_services_active ON public.services(is_active);

-- Insert sample data for existing users (optional)
INSERT INTO public.services (salon_id, name, category, duration, price, description, popular) 
SELECT 
  id as salon_id,
  'Haircut & Style' as name,
  'Hair' as category,
  60 as duration,
  85.00 as price,
  'Professional haircut with styling' as description,
  true as popular
FROM public.profiles 
WHERE role = 'salon_owner'
ON CONFLICT DO NOTHING;

INSERT INTO public.services (salon_id, name, category, duration, price, description, popular) 
SELECT 
  id as salon_id,
  'Hair Coloring' as name,
  'Hair' as category,
  120 as duration,
  150.00 as price,
  'Full hair coloring service' as description,
  true as popular
FROM public.profiles 
WHERE role = 'salon_owner'
ON CONFLICT DO NOTHING;

INSERT INTO public.services (salon_id, name, category, duration, price, description, popular) 
SELECT 
  id as salon_id,
  'Manicure' as name,
  'Nails' as category,
  45 as duration,
  40.00 as price,
  'Classic manicure with polish' as description,
  false as popular
FROM public.profiles 
WHERE role = 'salon_owner'
ON CONFLICT DO NOTHING;

INSERT INTO public.services (salon_id, name, category, duration, price, description, popular) 
SELECT 
  id as salon_id,
  'Facial Treatment' as name,
  'Skincare' as category,
  75 as duration,
  95.00 as price,
  'Deep cleansing facial with moisturizing' as description,
  true as popular
FROM public.profiles 
WHERE role = 'salon_owner'
ON CONFLICT DO NOTHING;

INSERT INTO public.services (salon_id, name, category, duration, price, description, popular) 
SELECT 
  id as salon_id,
  'Pedicure' as name,
  'Nails' as category,
  60 as duration,
  55.00 as price,
  'Relaxing pedicure with foot massage' as description,
  false as popular
FROM public.profiles 
WHERE role = 'salon_owner'
ON CONFLICT DO NOTHING;
