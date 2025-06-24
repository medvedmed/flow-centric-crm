
-- Create products table for inventory management
CREATE TABLE IF NOT EXISTS public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  salon_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'General',
  sku TEXT,
  cost_price NUMERIC DEFAULT 0.00,
  selling_price NUMERIC NOT NULL DEFAULT 0.00,
  current_stock INTEGER NOT NULL DEFAULT 0,
  minimum_stock INTEGER DEFAULT 0,
  maximum_stock INTEGER,
  supplier_name TEXT,
  supplier_contact TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create client payments table for billing
CREATE TABLE IF NOT EXISTS public.client_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  salon_id UUID NOT NULL,
  client_id UUID NOT NULL,
  amount NUMERIC NOT NULL,
  payment_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  payment_method TEXT DEFAULT 'cash',
  notes TEXT,
  appointment_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create staff performance table
CREATE TABLE IF NOT EXISTS public.staff_performance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  salon_id UUID NOT NULL,
  staff_id UUID NOT NULL,
  month DATE NOT NULL,
  total_clients INTEGER DEFAULT 0,
  new_clients INTEGER DEFAULT 0,
  regular_clients INTEGER DEFAULT 0,
  total_revenue NUMERIC DEFAULT 0,
  appointments_completed INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(salon_id, staff_id, month)
);

-- Enable RLS on new tables
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_performance ENABLE ROW LEVEL SECURITY;

-- RLS policies for products
CREATE POLICY "Users can view their salon products" ON public.products
  FOR SELECT USING (salon_id = auth.uid());
CREATE POLICY "Users can create products for their salon" ON public.products
  FOR INSERT WITH CHECK (salon_id = auth.uid());
CREATE POLICY "Users can update their salon products" ON public.products
  FOR UPDATE USING (salon_id = auth.uid());
CREATE POLICY "Users can delete their salon products" ON public.products
  FOR DELETE USING (salon_id = auth.uid());

-- RLS policies for client payments
CREATE POLICY "Users can view their salon payments" ON public.client_payments
  FOR SELECT USING (salon_id = auth.uid());
CREATE POLICY "Users can create payments for their salon" ON public.client_payments
  FOR INSERT WITH CHECK (salon_id = auth.uid());
CREATE POLICY "Users can update their salon payments" ON public.client_payments
  FOR UPDATE USING (salon_id = auth.uid());

-- RLS policies for staff performance
CREATE POLICY "Users can view their salon staff performance" ON public.staff_performance
  FOR SELECT USING (salon_id = auth.uid());
CREATE POLICY "Users can create staff performance for their salon" ON public.staff_performance
  FOR INSERT WITH CHECK (salon_id = auth.uid());
CREATE POLICY "Users can update their salon staff performance" ON public.staff_performance
  FOR UPDATE USING (salon_id = auth.uid());

-- Function to update staff performance automatically
CREATE OR REPLACE FUNCTION update_staff_performance()
RETURNS TRIGGER AS $$
BEGIN
  -- Update staff performance when appointment is completed
  IF NEW.status = 'Completed' AND (OLD.status IS NULL OR OLD.status != 'Completed') THEN
    INSERT INTO public.staff_performance (
      salon_id, staff_id, month, total_clients, appointments_completed, total_revenue
    )
    SELECT 
      NEW.salon_id,
      NEW.staff_id,
      DATE_TRUNC('month', NEW.date),
      1,
      1,
      NEW.price
    ON CONFLICT (salon_id, staff_id, month) 
    DO UPDATE SET
      total_clients = staff_performance.total_clients + 1,
      appointments_completed = staff_performance.appointments_completed + 1,
      total_revenue = staff_performance.total_revenue + NEW.price,
      updated_at = now();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for staff performance updates
DROP TRIGGER IF EXISTS update_staff_performance_trigger ON public.appointments;
CREATE TRIGGER update_staff_performance_trigger
  AFTER INSERT OR UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION update_staff_performance();
