
-- Create inventory management tables
CREATE TABLE public.inventory_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  salon_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'General',
  sku TEXT,
  current_stock INTEGER NOT NULL DEFAULT 0,
  minimum_stock INTEGER NOT NULL DEFAULT 0,
  maximum_stock INTEGER,
  unit_price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  supplier_name TEXT,
  supplier_contact TEXT,
  last_restocked_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create financial transactions table
CREATE TABLE public.financial_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  salon_id UUID NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('income', 'expense')),
  category TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  description TEXT,
  payment_method TEXT DEFAULT 'cash',
  reference_id UUID, -- Links to appointments, inventory purchases, etc.
  reference_type TEXT, -- 'appointment', 'inventory', 'staff_payment', etc.
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create appointment services junction table for multiple services per appointment
CREATE TABLE public.appointment_services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id UUID NOT NULL,
  service_name TEXT NOT NULL,
  service_price NUMERIC(10,2) NOT NULL,
  service_duration INTEGER NOT NULL DEFAULT 60,
  staff_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create receipt templates table
CREATE TABLE public.receipt_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  salon_id UUID NOT NULL,
  template_name TEXT NOT NULL DEFAULT 'Default',
  header_text TEXT,
  footer_text TEXT,
  logo_url TEXT,
  include_service_details BOOLEAN DEFAULT true,
  include_staff_name BOOLEAN DEFAULT true,
  include_salon_info BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add indexes for better performance
CREATE INDEX idx_inventory_items_salon_id ON public.inventory_items(salon_id);
CREATE INDEX idx_inventory_items_category ON public.inventory_items(category);
CREATE INDEX idx_financial_transactions_salon_id ON public.financial_transactions(salon_id);
CREATE INDEX idx_financial_transactions_date ON public.financial_transactions(transaction_date);
CREATE INDEX idx_financial_transactions_type ON public.financial_transactions(transaction_type);
CREATE INDEX idx_appointment_services_appointment_id ON public.appointment_services(appointment_id);
CREATE INDEX idx_receipt_templates_salon_id ON public.receipt_templates(salon_id);

-- Enable RLS on all new tables
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointment_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipt_templates ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for inventory_items
CREATE POLICY "Users can view their salon's inventory" 
  ON public.inventory_items 
  FOR SELECT 
  USING (salon_id = auth.uid());

CREATE POLICY "Users can create inventory for their salon" 
  ON public.inventory_items 
  FOR INSERT 
  WITH CHECK (salon_id = auth.uid());

CREATE POLICY "Users can update their salon's inventory" 
  ON public.inventory_items 
  FOR UPDATE 
  USING (salon_id = auth.uid());

CREATE POLICY "Users can delete their salon's inventory" 
  ON public.inventory_items 
  FOR DELETE 
  USING (salon_id = auth.uid());

-- Create RLS policies for financial_transactions
CREATE POLICY "Users can view their salon's transactions" 
  ON public.financial_transactions 
  FOR SELECT 
  USING (salon_id = auth.uid());

CREATE POLICY "Users can create transactions for their salon" 
  ON public.financial_transactions 
  FOR INSERT 
  WITH CHECK (salon_id = auth.uid());

CREATE POLICY "Users can update their salon's transactions" 
  ON public.financial_transactions 
  FOR UPDATE 
  USING (salon_id = auth.uid());

CREATE POLICY "Users can delete their salon's transactions" 
  ON public.financial_transactions 
  FOR DELETE 
  USING (salon_id = auth.uid());

-- Create RLS policies for appointment_services
CREATE POLICY "Users can view appointment services for their salon" 
  ON public.appointment_services 
  FOR SELECT 
  USING (
    appointment_id IN (
      SELECT id FROM public.appointments WHERE salon_id = auth.uid()
    )
  );

CREATE POLICY "Users can create appointment services for their salon" 
  ON public.appointment_services 
  FOR INSERT 
  WITH CHECK (
    appointment_id IN (
      SELECT id FROM public.appointments WHERE salon_id = auth.uid()
    )
  );

CREATE POLICY "Users can update appointment services for their salon" 
  ON public.appointment_services 
  FOR UPDATE 
  USING (
    appointment_id IN (
      SELECT id FROM public.appointments WHERE salon_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete appointment services for their salon" 
  ON public.appointment_services 
  FOR DELETE 
  USING (
    appointment_id IN (
      SELECT id FROM public.appointments WHERE salon_id = auth.uid()
    )
  );

-- Create RLS policies for receipt_templates
CREATE POLICY "Users can view their salon's receipt templates" 
  ON public.receipt_templates 
  FOR SELECT 
  USING (salon_id = auth.uid());

CREATE POLICY "Users can create receipt templates for their salon" 
  ON public.receipt_templates 
  FOR INSERT 
  WITH CHECK (salon_id = auth.uid());

CREATE POLICY "Users can update their salon's receipt templates" 
  ON public.receipt_templates 
  FOR UPDATE 
  USING (salon_id = auth.uid());

CREATE POLICY "Users can delete their salon's receipt templates" 
  ON public.receipt_templates 
  FOR DELETE 
  USING (salon_id = auth.uid());

-- Add trigger for updated_at timestamps
CREATE TRIGGER update_inventory_items_updated_at 
  BEFORE UPDATE ON public.inventory_items 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_financial_transactions_updated_at 
  BEFORE UPDATE ON public.financial_transactions 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_receipt_templates_updated_at 
  BEFORE UPDATE ON public.receipt_templates 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to automatically create financial transaction for completed appointments
CREATE OR REPLACE FUNCTION public.create_appointment_transaction()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only create transaction when appointment status changes to 'Completed'
  IF NEW.status = 'Completed' AND (OLD.status IS NULL OR OLD.status != 'Completed') THEN
    INSERT INTO public.financial_transactions (
      salon_id,
      transaction_type,
      category,
      amount,
      description,
      reference_id,
      reference_type,
      transaction_date
    ) VALUES (
      NEW.salon_id,
      'income',
      'Service Revenue',
      NEW.price,
      'Payment for ' || NEW.service || ' - ' || NEW.client_name,
      NEW.id,
      'appointment',
      NEW.date
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for automatic financial transaction creation
CREATE TRIGGER create_appointment_transaction_trigger
  AFTER UPDATE ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.create_appointment_transaction();
