
-- Add composite indexes for better query performance
-- These indexes will significantly improve query speed for salon-specific data

-- Clients table optimizations
CREATE INDEX IF NOT EXISTS idx_clients_salon_created 
ON public.clients (salon_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_clients_salon_status 
ON public.clients (salon_id, status);

CREATE INDEX IF NOT EXISTS idx_clients_salon_name 
ON public.clients (salon_id, name);

CREATE INDEX IF NOT EXISTS idx_clients_search 
ON public.clients USING gin(to_tsvector('english', name || ' ' || COALESCE(email, '') || ' ' || COALESCE(phone, '')));

-- Staff table optimizations
CREATE INDEX IF NOT EXISTS idx_staff_salon_status 
ON public.staff (salon_id, status);

CREATE INDEX IF NOT EXISTS idx_staff_salon_name 
ON public.staff (salon_id, name);

-- Appointments table optimizations
CREATE INDEX IF NOT EXISTS idx_appointments_salon_date 
ON public.appointments (salon_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_appointments_salon_staff_date 
ON public.appointments (salon_id, staff_id, date);

CREATE INDEX IF NOT EXISTS idx_appointments_salon_client_date 
ON public.appointments (salon_id, client_id, date);

CREATE INDEX IF NOT EXISTS idx_appointments_salon_status 
ON public.appointments (salon_id, status);

-- Add updated_at triggers for better cache invalidation
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply the trigger to all relevant tables (only if they don't exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_clients_updated_at') THEN
        CREATE TRIGGER update_clients_updated_at 
            BEFORE UPDATE ON public.clients 
            FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_staff_updated_at') THEN
        CREATE TRIGGER update_staff_updated_at 
            BEFORE UPDATE ON public.staff 
            FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_appointments_updated_at') THEN
        CREATE TRIGGER update_appointments_updated_at 
            BEFORE UPDATE ON public.appointments 
            FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
END $$;

-- Enable query performance tracking (if available)
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Add table statistics for query planner optimization
ANALYZE public.clients;
ANALYZE public.staff;
ANALYZE public.appointments;
ANALYZE public.profiles;
