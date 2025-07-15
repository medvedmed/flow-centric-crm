-- Create triggers to automatically log changes to key tables

-- Function to log changes
CREATE OR REPLACE FUNCTION public.log_audit_trail()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log if we have a valid salon_id and user
  IF (TG_OP = 'DELETE') THEN
    IF OLD.salon_id IS NOT NULL AND auth.uid() IS NOT NULL THEN
      INSERT INTO public.audit_logs (
        salon_id,
        table_name,
        record_id,
        action,
        old_data,
        new_data,
        changed_by
      ) VALUES (
        OLD.salon_id,
        TG_TABLE_NAME,
        OLD.id,
        TG_OP,
        to_jsonb(OLD),
        NULL,
        auth.uid()
      );
    END IF;
    RETURN OLD;
  ELSIF (TG_OP = 'UPDATE') THEN
    IF NEW.salon_id IS NOT NULL AND auth.uid() IS NOT NULL THEN
      INSERT INTO public.audit_logs (
        salon_id,
        table_name,
        record_id,
        action,
        old_data,
        new_data,
        changed_by
      ) VALUES (
        NEW.salon_id,
        TG_TABLE_NAME,
        NEW.id,
        TG_OP,
        to_jsonb(OLD),
        to_jsonb(NEW),
        auth.uid()
      );
    END IF;
    RETURN NEW;
  ELSIF (TG_OP = 'INSERT') THEN
    IF NEW.salon_id IS NOT NULL AND auth.uid() IS NOT NULL THEN
      INSERT INTO public.audit_logs (
        salon_id,
        table_name,
        record_id,
        action,
        old_data,
        new_data,
        changed_by
      ) VALUES (
        NEW.salon_id,
        TG_TABLE_NAME,
        NEW.id,
        TG_OP,
        NULL,
        to_jsonb(NEW),
        auth.uid()
      );
    END IF;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for key tables
CREATE TRIGGER audit_appointments_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_trail();

CREATE TRIGGER audit_clients_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_trail();

CREATE TRIGGER audit_staff_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.staff
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_trail();

CREATE TRIGGER audit_services_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_trail();

CREATE TRIGGER audit_financial_transactions_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.financial_transactions
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_trail();

CREATE TRIGGER audit_payment_methods_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.payment_methods
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_trail();