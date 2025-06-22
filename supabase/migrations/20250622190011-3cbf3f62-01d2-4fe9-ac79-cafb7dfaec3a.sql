
-- Create clients table
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  status TEXT DEFAULT 'New' CHECK (status IN ('New', 'Regular', 'VIP', 'Active', 'Inactive')),
  assigned_staff TEXT,
  notes TEXT,
  tags TEXT,
  total_spent DECIMAL(10,2) DEFAULT 0,
  visits INTEGER DEFAULT 0,
  preferred_stylist TEXT,
  last_visit TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create staff table
CREATE TABLE public.staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  specialties TEXT[],
  working_hours_start TIME,
  working_hours_end TIME,
  efficiency INTEGER DEFAULT 100,
  rating DECIMAL(3,2) DEFAULT 5.0,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create appointments table
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  staff_id UUID REFERENCES public.staff(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  client_phone TEXT,
  service TEXT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  date DATE NOT NULL,
  price DECIMAL(10,2) DEFAULT 0,
  duration INTEGER DEFAULT 60,
  status TEXT DEFAULT 'Scheduled' CHECK (status IN ('Scheduled', 'Confirmed', 'In Progress', 'Completed', 'Cancelled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allowing all operations for now - will add auth later)
CREATE POLICY "Allow all operations on clients" ON public.clients FOR ALL USING (true);
CREATE POLICY "Allow all operations on staff" ON public.staff FOR ALL USING (true);
CREATE POLICY "Allow all operations on appointments" ON public.appointments FOR ALL USING (true);

-- Insert some sample staff data
INSERT INTO public.staff (id, name, specialties, working_hours_start, working_hours_end, efficiency, rating, image_url) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Sarah Johnson', ARRAY['Hair Styling', 'Coloring'], '09:00', '17:00', 95, 4.8, 'https://images.unsplash.com/photo-1494790108755-2616b612b494?w=400&h=400&fit=crop&crop=face'),
('550e8400-e29b-41d4-a716-446655440002', 'Michael Chen', ARRAY['Massage', 'Facial'], '10:00', '18:00', 92, 4.9, 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face');
