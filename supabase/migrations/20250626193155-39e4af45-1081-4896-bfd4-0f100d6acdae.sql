
-- Create client retention analytics table
CREATE TABLE public.client_retention_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  salon_id UUID NOT NULL,
  client_id UUID NOT NULL,
  staff_id UUID,
  total_visits INTEGER NOT NULL DEFAULT 0,
  first_visit_date DATE,
  last_visit_date DATE,
  client_category TEXT NOT NULL DEFAULT 'New', -- 'New', 'Returning', 'Loyal'
  days_since_last_visit INTEGER,
  total_spent NUMERIC DEFAULT 0.00,
  average_days_between_visits NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create staff retention metrics table
CREATE TABLE public.staff_retention_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  salon_id UUID NOT NULL,
  staff_id UUID NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_unique_clients INTEGER NOT NULL DEFAULT 0,
  new_clients INTEGER NOT NULL DEFAULT 0,
  returning_clients INTEGER NOT NULL DEFAULT 0,
  loyal_clients INTEGER NOT NULL DEFAULT 0,
  retention_rate NUMERIC NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(salon_id, staff_id, period_start, period_end)
);

-- Add indexes for better performance
CREATE INDEX idx_client_retention_salon_client ON public.client_retention_analytics(salon_id, client_id);
CREATE INDEX idx_client_retention_staff ON public.client_retention_analytics(salon_id, staff_id);
CREATE INDEX idx_staff_retention_metrics_salon_staff ON public.staff_retention_metrics(salon_id, staff_id);
CREATE INDEX idx_staff_retention_metrics_period ON public.staff_retention_metrics(period_start, period_end);

-- Function to calculate client category based on visit count
CREATE OR REPLACE FUNCTION public.get_client_category(visit_count INTEGER)
RETURNS TEXT AS $$
BEGIN
  CASE 
    WHEN visit_count = 1 THEN RETURN 'New';
    WHEN visit_count BETWEEN 2 AND 4 THEN RETURN 'Returning';
    WHEN visit_count >= 5 THEN RETURN 'Loyal';
    ELSE RETURN 'New';
  END CASE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to update client retention analytics
CREATE OR REPLACE FUNCTION public.update_client_retention_analytics()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  client_stats RECORD;
BEGIN
  -- Only process completed appointments
  IF NEW.status = 'Completed' AND (OLD.status IS NULL OR OLD.status != 'Completed') THEN
    -- Calculate client statistics
    SELECT 
      COUNT(*) as total_visits,
      MIN(date) as first_visit,
      MAX(date) as last_visit,
      COALESCE(SUM(price), 0) as total_spent,
      CASE 
        WHEN COUNT(*) > 1 THEN 
          EXTRACT(EPOCH FROM (MAX(date) - MIN(date))) / (86400 * (COUNT(*) - 1))
        ELSE NULL 
      END as avg_days_between
    INTO client_stats
    FROM public.appointments 
    WHERE salon_id = NEW.salon_id 
      AND client_id = NEW.client_id 
      AND status = 'Completed';

    -- Insert or update client retention analytics
    INSERT INTO public.client_retention_analytics (
      salon_id,
      client_id,
      staff_id,
      total_visits,
      first_visit_date,
      last_visit_date,
      client_category,
      days_since_last_visit,
      total_spent,
      average_days_between_visits
    ) VALUES (
      NEW.salon_id,
      NEW.client_id,
      NEW.staff_id,
      client_stats.total_visits,
      client_stats.first_visit,
      client_stats.last_visit,
      public.get_client_category(client_stats.total_visits),
      EXTRACT(EPOCH FROM (CURRENT_DATE - client_stats.last_visit)) / 86400,
      client_stats.total_spent,
      client_stats.avg_days_between
    )
    ON CONFLICT (salon_id, client_id) 
    DO UPDATE SET
      staff_id = NEW.staff_id,
      total_visits = client_stats.total_visits,
      last_visit_date = client_stats.last_visit,
      client_category = public.get_client_category(client_stats.total_visits),
      days_since_last_visit = EXTRACT(EPOCH FROM (CURRENT_DATE - client_stats.last_visit)) / 86400,
      total_spent = client_stats.total_spent,
      average_days_between_visits = client_stats.avg_days_between,
      updated_at = now();
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to update retention analytics when appointments change
CREATE TRIGGER update_client_retention_trigger
  AFTER INSERT OR UPDATE ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_client_retention_analytics();

-- Function to calculate staff retention metrics for a period
CREATE OR REPLACE FUNCTION public.calculate_staff_retention_metrics(
  target_salon_id UUID,
  start_date DATE,
  end_date DATE
) RETURNS TABLE (
  staff_id UUID,
  staff_name TEXT,
  total_unique_clients INTEGER,
  new_clients INTEGER,
  returning_clients INTEGER,
  loyal_clients INTEGER,
  retention_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id as staff_id,
    s.name as staff_name,
    COUNT(DISTINCT cra.client_id)::INTEGER as total_unique_clients,
    COUNT(DISTINCT CASE WHEN cra.client_category = 'New' THEN cra.client_id END)::INTEGER as new_clients,
    COUNT(DISTINCT CASE WHEN cra.client_category = 'Returning' THEN cra.client_id END)::INTEGER as returning_clients,
    COUNT(DISTINCT CASE WHEN cra.client_category = 'Loyal' THEN cra.client_id END)::INTEGER as loyal_clients,
    CASE 
      WHEN COUNT(DISTINCT cra.client_id) > 0 THEN
        ROUND(
          (COUNT(DISTINCT CASE WHEN cra.client_category IN ('Returning', 'Loyal') THEN cra.client_id END)::NUMERIC / 
           COUNT(DISTINCT cra.client_id)::NUMERIC) * 100, 
          2
        )
      ELSE 0 
    END as retention_rate
  FROM public.staff s
  LEFT JOIN public.client_retention_analytics cra ON s.id = cra.staff_id
  LEFT JOIN public.appointments a ON cra.client_id = a.client_id AND cra.staff_id = a.staff_id
  WHERE s.salon_id = target_salon_id
    AND s.status = 'active'
    AND (start_date IS NULL OR a.date >= start_date)
    AND (end_date IS NULL OR a.date <= end_date)
    AND (a.status = 'Completed' OR a.status IS NULL)
  GROUP BY s.id, s.name
  ORDER BY retention_rate DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add constraint to ensure unique salon_id, client_id combination
ALTER TABLE public.client_retention_analytics 
ADD CONSTRAINT unique_salon_client UNIQUE (salon_id, client_id);
