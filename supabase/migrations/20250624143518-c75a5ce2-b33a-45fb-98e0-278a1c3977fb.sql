
-- Add selling price to inventory items
ALTER TABLE inventory_items 
ADD COLUMN selling_price NUMERIC DEFAULT 0.00,
ADD COLUMN cost_price NUMERIC DEFAULT 0.00;

-- Update existing items to have cost_price = unit_price and set a default selling price
UPDATE inventory_items 
SET cost_price = unit_price, 
    selling_price = unit_price * 1.5 
WHERE cost_price IS NULL;

-- Create product_sales table for detailed tracking
CREATE TABLE public.product_sales (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  salon_id UUID NOT NULL,
  inventory_item_id UUID NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_cost NUMERIC NOT NULL DEFAULT 0.00,
  unit_selling_price NUMERIC NOT NULL DEFAULT 0.00,
  total_cost NUMERIC NOT NULL DEFAULT 0.00,
  total_revenue NUMERIC NOT NULL DEFAULT 0.00,
  profit NUMERIC NOT NULL DEFAULT 0.00,
  sale_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_method TEXT DEFAULT 'cash',
  customer_name TEXT,
  customer_phone TEXT,
  transaction_id UUID REFERENCES financial_transactions(id),
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for product_sales
ALTER TABLE public.product_sales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their salon's product sales" 
  ON public.product_sales 
  FOR SELECT 
  USING (
    salon_id IN (
      SELECT id FROM profiles WHERE id = auth.uid()
      UNION
      SELECT salon_id FROM user_roles WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Users can create product sales for their salon" 
  ON public.product_sales 
  FOR INSERT 
  WITH CHECK (
    salon_id IN (
      SELECT id FROM profiles WHERE id = auth.uid()
      UNION
      SELECT salon_id FROM user_roles WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Users can update their salon's product sales" 
  ON public.product_sales 
  FOR UPDATE 
  USING (
    salon_id IN (
      SELECT id FROM profiles WHERE id = auth.uid()
      UNION
      SELECT salon_id FROM user_roles WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Users can delete their salon's product sales" 
  ON public.product_sales 
  FOR DELETE 
  USING (
    salon_id IN (
      SELECT id FROM profiles WHERE id = auth.uid()
      UNION
      SELECT salon_id FROM user_roles WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Add product sale category to financial transactions
ALTER TABLE financial_transactions 
ADD COLUMN product_sale_id UUID REFERENCES product_sales(id);

-- Create function to update inventory stock on product sale
CREATE OR REPLACE FUNCTION update_inventory_on_sale()
RETURNS TRIGGER AS $$
BEGIN
  -- Decrease stock when product is sold
  UPDATE inventory_items 
  SET current_stock = current_stock - NEW.quantity,
      updated_at = now()
  WHERE id = NEW.inventory_item_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update inventory on product sale
CREATE TRIGGER trigger_update_inventory_on_sale
  AFTER INSERT ON product_sales
  FOR EACH ROW
  EXECUTE FUNCTION update_inventory_on_sale();
