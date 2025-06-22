
-- Create user profiles table to store additional user information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  salon_name TEXT,
  phone TEXT,
  role TEXT DEFAULT 'salon_owner' CHECK (role IN ('salon_owner', 'staff', 'admin')),
  subscription_status TEXT DEFAULT 'trial' CHECK (subscription_status IN ('trial', 'active', 'cancelled', 'expired')),
  subscription_end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policy for profiles - users can only see their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Add salon_id to link data to specific salons
ALTER TABLE public.clients ADD COLUMN salon_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.staff ADD COLUMN salon_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.appointments ADD COLUMN salon_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Update RLS policies to be salon-specific
DROP POLICY "Allow all operations on clients" ON public.clients;
DROP POLICY "Allow all operations on staff" ON public.staff;
DROP POLICY "Allow all operations on appointments" ON public.appointments;

-- Create salon-specific policies for clients
CREATE POLICY "Salon owners can manage their clients" ON public.clients
  FOR ALL USING (salon_id = auth.uid());

-- Create salon-specific policies for staff
CREATE POLICY "Salon owners can manage their staff" ON public.staff
  FOR ALL USING (salon_id = auth.uid());

-- Create salon-specific policies for appointments
CREATE POLICY "Salon owners can manage their appointments" ON public.appointments
  FOR ALL USING (salon_id = auth.uid());

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email)
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update existing staff to have salon_id (using first profile as default)
UPDATE public.staff 
SET salon_id = (SELECT id FROM public.profiles LIMIT 1)
WHERE salon_id IS NULL;
