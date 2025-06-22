
-- First, let's implement proper RLS policies for existing tables
-- These policies ensure salon owners can only see their own data

-- RLS policies for clients table
CREATE POLICY "Salon owners can view their clients" 
  ON public.clients 
  FOR SELECT 
  USING (auth.uid() = salon_id);

CREATE POLICY "Salon owners can create clients for their salon" 
  ON public.clients 
  FOR INSERT 
  WITH CHECK (auth.uid() = salon_id);

CREATE POLICY "Salon owners can update their clients" 
  ON public.clients 
  FOR UPDATE 
  USING (auth.uid() = salon_id);

CREATE POLICY "Salon owners can delete their clients" 
  ON public.clients 
  FOR DELETE 
  USING (auth.uid() = salon_id);

-- RLS policies for appointments table
CREATE POLICY "Salon owners can view their appointments" 
  ON public.appointments 
  FOR SELECT 
  USING (auth.uid() = salon_id);

CREATE POLICY "Salon owners can create appointments for their salon" 
  ON public.appointments 
  FOR INSERT 
  WITH CHECK (auth.uid() = salon_id);

CREATE POLICY "Salon owners can update their appointments" 
  ON public.appointments 
  FOR UPDATE 
  USING (auth.uid() = salon_id);

CREATE POLICY "Salon owners can delete their appointments" 
  ON public.appointments 
  FOR DELETE 
  USING (auth.uid() = salon_id);

-- Create time-off requests table
CREATE TABLE public.time_off_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
  salon_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES public.profiles(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for time-off requests
ALTER TABLE public.time_off_requests ENABLE ROW LEVEL SECURITY;

-- RLS policies for time-off requests
CREATE POLICY "Salon owners can view their staff time-off requests" 
  ON public.time_off_requests 
  FOR SELECT 
  USING (auth.uid() = salon_id);

CREATE POLICY "Salon owners can create time-off requests for their staff" 
  ON public.time_off_requests 
  FOR INSERT 
  WITH CHECK (auth.uid() = salon_id);

CREATE POLICY "Salon owners can update their staff time-off requests" 
  ON public.time_off_requests 
  FOR UPDATE 
  USING (auth.uid() = salon_id);

CREATE POLICY "Salon owners can delete their staff time-off requests" 
  ON public.time_off_requests 
  FOR DELETE 
  USING (auth.uid() = salon_id);

-- Create staff availability overrides table
CREATE TABLE public.staff_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
  salon_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  is_available BOOLEAN DEFAULT TRUE,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(staff_id, date)
);

-- Enable RLS for staff availability
ALTER TABLE public.staff_availability ENABLE ROW LEVEL SECURITY;

-- RLS policies for staff availability
CREATE POLICY "Salon owners can view their staff availability" 
  ON public.staff_availability 
  FOR SELECT 
  USING (auth.uid() = salon_id);

CREATE POLICY "Salon owners can create staff availability for their staff" 
  ON public.staff_availability 
  FOR INSERT 
  WITH CHECK (auth.uid() = salon_id);

CREATE POLICY "Salon owners can update their staff availability" 
  ON public.staff_availability 
  FOR UPDATE 
  USING (auth.uid() = salon_id);

CREATE POLICY "Salon owners can delete their staff availability" 
  ON public.staff_availability 
  FOR DELETE 
  USING (auth.uid() = salon_id);

-- Add proper foreign key constraints to appointments table
ALTER TABLE public.appointments 
ADD CONSTRAINT fk_appointments_staff 
FOREIGN KEY (staff_id) REFERENCES public.staff(id) ON DELETE SET NULL;

ALTER TABLE public.appointments 
ADD CONSTRAINT fk_appointments_client 
FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE SET NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_time_off_requests_staff_id ON public.time_off_requests(staff_id);
CREATE INDEX IF NOT EXISTS idx_time_off_requests_salon_id ON public.time_off_requests(salon_id);
CREATE INDEX IF NOT EXISTS idx_time_off_requests_dates ON public.time_off_requests(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_time_off_requests_status ON public.time_off_requests(status);

CREATE INDEX IF NOT EXISTS idx_staff_availability_staff_id ON public.staff_availability(staff_id);
CREATE INDEX IF NOT EXISTS idx_staff_availability_salon_id ON public.staff_availability(salon_id);
CREATE INDEX IF NOT EXISTS idx_staff_availability_date ON public.staff_availability(date);

-- Update triggers for updated_at columns
CREATE TRIGGER update_time_off_requests_updated_at 
  BEFORE UPDATE ON public.time_off_requests 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_staff_availability_updated_at 
  BEFORE UPDATE ON public.staff_availability 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
