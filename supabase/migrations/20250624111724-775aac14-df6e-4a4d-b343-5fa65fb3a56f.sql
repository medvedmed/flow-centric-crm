
-- Add payment_status column to appointments table
ALTER TABLE public.appointments 
ADD COLUMN payment_status text DEFAULT 'unpaid';

-- Add payment_date column to track when payment was made
ALTER TABLE public.appointments 
ADD COLUMN payment_date timestamp with time zone;

-- Add payment_method column to track how payment was made
ALTER TABLE public.appointments 
ADD COLUMN payment_method text;

-- Update existing appointments to have 'paid' status if they have associated financial transactions
UPDATE public.appointments 
SET payment_status = 'paid'
WHERE id IN (
  SELECT DISTINCT reference_id 
  FROM public.financial_transactions 
  WHERE reference_type = 'appointment' 
  AND transaction_type = 'income'
);

-- Create index for better performance on payment status queries
CREATE INDEX IF NOT EXISTS idx_appointments_payment_status ON public.appointments(payment_status);
CREATE INDEX IF NOT EXISTS idx_appointments_date_payment_status ON public.appointments(date, payment_status);
