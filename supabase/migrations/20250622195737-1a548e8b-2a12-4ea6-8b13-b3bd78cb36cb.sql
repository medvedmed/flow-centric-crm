
-- Add missing staff management functions to the staff table
-- Update staff table to include additional fields for comprehensive management
ALTER TABLE public.staff 
ADD COLUMN IF NOT EXISTS working_days text[] DEFAULT ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
ADD COLUMN IF NOT EXISTS break_start time without time zone DEFAULT '12:00',
ADD COLUMN IF NOT EXISTS break_end time without time zone DEFAULT '13:00',
ADD COLUMN IF NOT EXISTS hourly_rate numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS commission_rate integer DEFAULT 35,
ADD COLUMN IF NOT EXISTS status text DEFAULT 'active',
ADD COLUMN IF NOT EXISTS notes text,
ADD COLUMN IF NOT EXISTS hire_date date DEFAULT CURRENT_DATE;

-- Enable RLS for staff table
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for staff table
CREATE POLICY "Users can view their salon staff" 
  ON public.staff 
  FOR SELECT 
  USING (auth.uid() = salon_id);

CREATE POLICY "Users can create staff for their salon" 
  ON public.staff 
  FOR INSERT 
  WITH CHECK (auth.uid() = salon_id);

CREATE POLICY "Users can update their salon staff" 
  ON public.staff 
  FOR UPDATE 
  USING (auth.uid() = salon_id);

CREATE POLICY "Users can delete their salon staff" 
  ON public.staff 
  FOR DELETE 
  USING (auth.uid() = salon_id);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_staff_salon_id ON public.staff(salon_id);
CREATE INDEX IF NOT EXISTS idx_staff_status ON public.staff(status);
