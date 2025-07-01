
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Edit3 } from 'lucide-react';
import { Appointment } from '@/services/types';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { AppointmentDetailsPanel } from './AppointmentDetailsPanel';
import { AppointmentServicesPanel } from './AppointmentServicesPanel';
import { QuickPaymentPanel } from './QuickPaymentPanel';

interface AppointmentService {
  id: string;
  service_name: string;
  service_price: number;
  service_duration: number;
  staff_id?: string;
}

interface AppointmentDetailsDialogProps {
  appointment: Appointment | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AppointmentDetailsDialog: React.FC<AppointmentDetailsDialogProps> = ({
  appointment,
  isOpen,
  onClose
}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch appointment services
  const { data: appointmentServices = [] } = useQuery({
    queryKey: ['appointment-services', appointment?.id],
    queryFn: async () => {
      if (!appointment?.id) return [];
      
      const { data, error } = await supabase
        .from('appointment_services')
        .select('*')
        .eq('appointment_id', appointment.id);

      if (error) throw error;
      return data as AppointmentService[];
    },
    enabled: !!appointment?.id,
  });

  // Fetch payment methods
  const { data: paymentMethods = [] } = useQuery({
    queryKey: ['payment-methods'],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('salon_id', user.id)
        .eq('is_active', true);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const handlePaymentComplete = () => {
    queryClient.invalidateQueries({ queryKey: ['appointments'] });
    queryClient.invalidateQueries({ queryKey: ['financial-transactions'] });
  };

  if (!appointment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white to-violet-50">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
            Appointment Details
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="details" className="space-y-6">
          <TabsList className="bg-white/70 backdrop-blur-sm">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="payment">Quick Payment</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <AppointmentDetailsPanel appointment={appointment} />
          </TabsContent>

          <TabsContent value="services" className="space-y-4">
            <AppointmentServicesPanel 
              appointment={appointment}
              appointmentServices={appointmentServices}
            />
          </TabsContent>

          <TabsContent value="payment">
            <QuickPaymentPanel 
              appointment={appointment} 
              appointmentServices={appointmentServices}
              paymentMethods={paymentMethods}
              onPaymentComplete={handlePaymentComplete}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
