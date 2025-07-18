
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Appointment } from '@/services/types';

interface AppointmentService {
  id: string;
  service_name: string;
  service_price: number;
  service_duration: number;
  staff_id?: string;
}

interface AppointmentProduct {
  id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export const useAppointmentDetails = (appointmentId: string) => {
  return useQuery({
    queryKey: ['appointment-details', appointmentId],
    queryFn: async () => {
      // Fetch appointment services
      const { data: services, error: servicesError } = await supabase
        .from('appointment_services')
        .select('*')
        .eq('appointment_id', appointmentId);

      if (servicesError) throw servicesError;

      // Fetch appointment products
      const { data: products, error: productsError } = await supabase
        .from('appointment_products')
        .select('*')
        .eq('appointment_id', appointmentId);

      if (productsError) throw productsError;

      return {
        services: services as AppointmentService[],
        products: products as AppointmentProduct[]
      };
    },
    enabled: !!appointmentId,
    staleTime: 30 * 1000, // 30 seconds
  });
};
