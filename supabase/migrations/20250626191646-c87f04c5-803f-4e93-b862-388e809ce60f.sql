
-- Create enhanced financial transactions table
CREATE TABLE IF NOT EXISTS public.finance_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  salon_id UUID NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('income', 'expense')),
  client_name TEXT,
  amount NUMERIC NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'cash',
  category TEXT NOT NULL,
  description TEXT,
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  invoice_id TEXT,
  is_tip BOOLEAN DEFAULT FALSE,
  staff_id UUID
);

-- Create accounts table for payment methods
CREATE TABLE IF NOT EXISTS public.finance_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  salon_id UUID NOT NULL,
  account_name TEXT NOT NULL,
  account_type TEXT NOT NULL CHECK (account_type IN ('cash', 'card', 'bank_transfer', 'digital_wallet')),
  current_balance NUMERIC NOT NULL DEFAULT 0.00,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(salon_id, account_name)
);

-- Create categories table
CREATE TABLE IF NOT EXISTS public.finance_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  salon_id UUID NOT NULL,
  category_name TEXT NOT NULL,
  category_type TEXT NOT NULL CHECK (category_type IN ('income', 'expense')),
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(salon_id, category_name, category_type)
);

-- Create analytics summary table for faster queries
CREATE TABLE IF NOT EXISTS public.finance_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  salon_id UUID NOT NULL,
  period_type TEXT NOT NULL CHECK (period_type IN ('day', 'week', 'month', 'year')),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_income NUMERIC NOT NULL DEFAULT 0.00,
  total_expenses NUMERIC NOT NULL DEFAULT 0.00,
  net_profit NUMERIC NOT NULL DEFAULT 0.00,
  profit_margin NUMERIC NOT NULL DEFAULT 0.00,
  transaction_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(salon_id, period_type, period_start)
);

-- Enable RLS on all tables
ALTER TABLE public.finance_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finance_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finance_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finance_analytics ENABLE ROW LEVEL SECURITY;

-- RLS policies for finance_transactions
CREATE POLICY "Users can view their own transactions" ON public.finance_transactions
  FOR SELECT USING (auth.uid() = salon_id);
CREATE POLICY "Users can create their own transactions" ON public.finance_transactions
  FOR INSERT WITH CHECK (auth.uid() = salon_id);
CREATE POLICY "Users can update their own transactions" ON public.finance_transactions
  FOR UPDATE USING (auth.uid() = salon_id);
CREATE POLICY "Users can delete their own transactions" ON public.finance_transactions
  FOR DELETE USING (auth.uid() = salon_id);

-- RLS policies for finance_accounts
CREATE POLICY "Users can view their own accounts" ON public.finance_accounts
  FOR SELECT USING (auth.uid() = salon_id);
CREATE POLICY "Users can create their own accounts" ON public.finance_accounts
  FOR INSERT WITH CHECK (auth.uid() = salon_id);
CREATE POLICY "Users can update their own accounts" ON public.finance_accounts
  FOR UPDATE USING (auth.uid() = salon_id);

-- RLS policies for finance_categories
CREATE POLICY "Users can view their own categories" ON public.finance_categories
  FOR SELECT USING (auth.uid() = salon_id);
CREATE POLICY "Users can create their own categories" ON public.finance_categories
  FOR INSERT WITH CHECK (auth.uid() = salon_id);
CREATE POLICY "Users can update their own categories" ON public.finance_categories
  FOR UPDATE USING (auth.uid() = salon_id);

-- RLS policies for finance_analytics
CREATE POLICY "Users can view their own analytics" ON public.finance_analytics
  FOR SELECT USING (auth.uid() = salon_id);
CREATE POLICY "Users can manage their own analytics" ON public.finance_analytics
  FOR ALL USING (auth.uid() = salon_id);

-- Insert default payment methods
INSERT INTO public.finance_accounts (salon_id, account_name, account_type, current_balance, is_active)
SELECT 
  auth.uid(),
  unnest(ARRAY['Cash', 'QNB Terminal', 'LINK Payment']),
  unnest(ARRAY['cash', 'card', 'digital_wallet']),
  0.00,
  TRUE
WHERE auth.uid() IS NOT NULL
ON CONFLICT (salon_id, account_name) DO NOTHING;

-- Insert default income categories
INSERT INTO public.finance_categories (salon_id, category_name, category_type, is_default)
SELECT 
  auth.uid(),
  unnest(ARRAY['Sales', 'Customer Balance', 'Deposit Income', 'Tips']),
  'income',
  TRUE
WHERE auth.uid() IS NOT NULL
ON CONFLICT (salon_id, category_name, category_type) DO NOTHING;

-- Insert default expense categories
INSERT INTO public.finance_categories (salon_id, category_name, category_type, is_default)
SELECT 
  auth.uid(),
  unnest(ARRAY['Visa Expenses', 'Tips', 'Charges', 'Rent', 'Utilities', 'Supplies']),
  'expense',
  TRUE
WHERE auth.uid() IS NOT NULL
ON CONFLICT (salon_id, category_name, category_type) DO NOTHING;

-- Function to update account balances
CREATE OR REPLACE FUNCTION update_account_balance()
RETURNS TRIGGER AS $$
BEGIN
  -- Update account balance based on transaction type
  IF TG_OP = 'INSERT' THEN
    UPDATE public.finance_accounts 
    SET current_balance = current_balance + 
      CASE 
        WHEN NEW.transaction_type = 'income' THEN NEW.amount
        ELSE -NEW.amount
      END,
      updated_at = now()
    WHERE salon_id = NEW.salon_id AND account_name = NEW.payment_method;
    
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Reverse old transaction
    UPDATE public.finance_accounts 
    SET current_balance = current_balance - 
      CASE 
        WHEN OLD.transaction_type = 'income' THEN OLD.amount
        ELSE -OLD.amount
      END
    WHERE salon_id = OLD.salon_id AND account_name = OLD.payment_method;
    
    -- Apply new transaction
    UPDATE public.finance_accounts 
    SET current_balance = current_balance + 
      CASE 
        WHEN NEW.transaction_type = 'income' THEN NEW.amount
        ELSE -NEW.amount
      END,
      updated_at = now()
    WHERE salon_id = NEW.salon_id AND account_name = NEW.payment_method;
    
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Reverse transaction
    UPDATE public.finance_accounts 
    SET current_balance = current_balance - 
      CASE 
        WHEN OLD.transaction_type = 'income' THEN OLD.amount
        ELSE -OLD.amount
      END,
      updated_at = now()
    WHERE salon_id = OLD.salon_id AND account_name = OLD.payment_method;
    
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers
CREATE TRIGGER update_finance_account_balance
  AFTER INSERT OR UPDATE OR DELETE ON public.finance_transactions
  FOR EACH ROW EXECUTE FUNCTION update_account_balance();

-- Function to update analytics data
CREATE OR REPLACE FUNCTION update_finance_analytics()
RETURNS TRIGGER AS $$
DECLARE
  day_start DATE;
  week_start DATE;
  month_start DATE;
  year_start DATE;
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    day_start := NEW.transaction_date;
    week_start := date_trunc('week', NEW.transaction_date)::DATE;
    month_start := date_trunc('month', NEW.transaction_date)::DATE;
    year_start := date_trunc('year', NEW.transaction_date)::DATE;
    
    -- Update daily analytics
    INSERT INTO public.finance_analytics (salon_id, period_type, period_start, period_end, total_income, total_expenses, net_profit, profit_margin, transaction_count)
    SELECT 
      NEW.salon_id,
      'day',
      day_start,
      day_start,
      COALESCE(SUM(CASE WHEN transaction_type = 'income' THEN amount ELSE 0 END), 0),
      COALESCE(SUM(CASE WHEN transaction_type = 'expense' THEN amount ELSE 0 END), 0),
      COALESCE(SUM(CASE WHEN transaction_type = 'income' THEN amount ELSE -amount END), 0),
      CASE 
        WHEN SUM(CASE WHEN transaction_type = 'income' THEN amount ELSE 0 END) > 0 
        THEN (SUM(CASE WHEN transaction_type = 'income' THEN amount ELSE -amount END) / SUM(CASE WHEN transaction_type = 'income' THEN amount ELSE 0 END)) * 100
        ELSE 0 
      END,
      COUNT(*)
    FROM public.finance_transactions 
    WHERE salon_id = NEW.salon_id AND transaction_date = day_start
    ON CONFLICT (salon_id, period_type, period_start) 
    DO UPDATE SET
      total_income = EXCLUDED.total_income,
      total_expenses = EXCLUDED.total_expenses,
      net_profit = EXCLUDED.net_profit,
      profit_margin = EXCLUDED.profit_margin,
      transaction_count = EXCLUDED.transaction_count,
      updated_at = now();
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create analytics trigger
CREATE TRIGGER update_analytics_on_transaction_change
  AFTER INSERT OR UPDATE OR DELETE ON public.finance_transactions
  FOR EACH ROW EXECUTE FUNCTION update_finance_analytics();
