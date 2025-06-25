import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash2, Calendar, Clock, User, DollarSign, CreditCard, Palette } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Appointment } from '@/services/types';

interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
}

interface ExtraService {
  id: string;
  name: string;
  price: number;
  duration: number;
}

interface EditAppointmentDialogProps {
  appointment: Appointment | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EditAppointmentDialog: React.FC<EditAppointmentDialogProps> = ({
  appointment,
  isOpen,
  onClose
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [extraServices, setExtraServices] = useState<ExtraService[]>([]);
  const [paymentStatus, setPaymentStatus] = useState<'paid' | 'unpaid' | 'partial'>(appointment?.paymentStatus || 'unpaid');
  const [paymentMethod, setPaymentMethod] = useState(appointment?.paymentMethod || 'cash');
  const [basePrice, setBasePrice] = useState(appointment?.price || 0);
  const [appointmentColor, setAppointmentColor] = useState(appointment?.color || '#007bff');

  const { data: services = [] } = useQuery({
    queryKey: ['services-for-appointment'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('salon_id', user?.id)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data as Service[];
    },
    enabled: !!user && isOpen,
  });

  const { data: staff = [] } = useQuery({
    queryKey: ['staff-for-appointment'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('staff')
        .select('*')
        .eq('salon_id', user?.id)
        .eq('status', 'active')
        .order('name');

      if (error) throw error;
      return data;
    },
    enabled: !!user && isOpen,
  });

  const { data: existingExtraServices = [] } = useQuery({
    queryKey: ['appointment-extra-services', appointment?.id],
    queryFn: async () => {
      if (!appointment?.id) return [];

      const { data, error } = await supabase
        .from('appointment_services')
        .select('*')
        .eq('appointment_id', appointment.id);

      if (error) throw error;

      return data.map(service => ({
        id: service.id,
        name: service.service_name,
        price: service.service_price,
        duration: service.service_duration
      }));
    },
    enabled: !!appointment?.id && isOpen,
  });

  useEffect(() => {
    if (appointment) {
      setExtraServices(existingExtraServices);
      setPaymentStatus(appointment.paymentStatus || 'unpaid');
      setPaymentMethod(appointment.paymentMethod || 'cash');
      setBasePrice(appointment.price || 0);
      setAppointmentColor(appointment.color || '#007bff');
    }
  }, [appointment, existingExtraServices]);

  const updateAppointmentMutation = useMutation({
    mutationFn: async (appointmentData: any) => {
      const totalExtraPrice = extraServices.reduce((sum, service) => sum + Number(service.price), 0);
      const finalPrice = Number(appointmentData.price) + totalExtraPrice;

      const { data: updatedAppointment, error: appointmentError } = await supabase
        .from('appointments')
        .update({
          client_name: appointmentData.client_name,
          client_phone: appointmentData.client_phone,
          service: appointmentData.service,
          staff_id: appointmentData.staff_id,
          date: appointmentData.date,
          start_time: appointmentData.start_time,
          end_time: appointmentData.end_time,
          price: finalPrice,
          duration: appointmentData.duration + extraServices.reduce((sum, service) => sum + Number(service.duration), 0),
          status: appointmentData.status,
          notes: appointmentData.notes,
          payment_status: paymentStatus,
          payment_method: paymentMethod,
          payment_date: paymentStatus === 'paid' ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
          color: appointmentColor
        })
        .eq('id', appointment?.id)
        .select()
        .single();

      if (appointmentError) throw appointmentError;

      if (extraServices.length > 0) {
        await supabase.from('appointment_services').delete().eq('appointment_id', appointment?.id);

        const serviceInserts = extraServices.map(service => ({
          appointment_id: appointment?.id,
          service_name: service.name,
          service_price: Number(service.price),
          service_duration: Number(service.duration),
          staff_id: appointmentData.staff_id
        }));

        const { error: servicesError } = await supabase.from('appointment_services').insert(serviceInserts);
        if (servicesError) throw servicesError;
      } else {
        await supabase.from('appointment_services').delete().eq('appointment_id', appointment?.id);
      }

      if (paymentStatus === 'paid' && appointment?.paymentStatus !== 'paid') {
        await supabase.from('financial_transactions').insert({
          salon_id: user?.id,
          transaction_type: 'income',
          category: 'Service Revenue',
          amount: finalPrice,
          description: `Payment for ${appointmentData.service} - ${appointmentData.client_name}`,
          payment_method: paymentMethod,
          reference_id: appointment?.id,
          reference_type: 'appointment',
          transaction_date: new Date().toISOString().split('T')[0],
          created_by: user?.id
        });
      }

      return updatedAppointment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['enhanced-schedule-appointments'] });
      queryClient.invalidateQueries({ queryKey: ['financial-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast({ title: 'Success', description: 'Appointment updated successfully!' });
      onClose();
      setExtraServices([]);
    },
    onError: (error) => {
      toast({ title: 'Error', description: 'Failed to update appointment', variant: 'destructive' });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!appointment) return;

    const formData = new FormData(e.currentTarget);
    const appointmentData = {
      client_name: formData.get('client_name') as string,
      client_phone: formData.get('client_phone') as string,
      service: formData.get('service') as string,
      staff_id: formData.get('staff_id') as string,
      date: formData.get('date') as string,
      start_time: formData.get('start_time') as string,
      end_time: formData.get('end_time') as string,
      price: parseFloat(formData.get('price') as string) || 0,
      duration: parseInt(formData.get('duration') as string) || 60,
      status: formData.get('status') as string,
      notes: formData.get('notes') as string,
    };

    updateAppointmentMutation.mutate(appointmentData);
  };

  const addExtraService = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    if (service && !extraServices.find(s => s.id === serviceId)) {
      setExtraServices(prev => [...prev, service]);
    }
  };

  const removeExtraService = (serviceId: string) => {
    setExtraServices(prev => prev.filter(s => s.id !== serviceId));
  };

  const totalExtraPrice = extraServices.reduce((sum, service) => sum + Number(service.price || 0), 0);
  const totalExtraDuration = extraServices.reduce((sum, service) => sum + Number(service.duration || 0), 0);
  const finalTotalPrice = Number(basePrice || 0) + totalExtraPrice;

  if (!appointment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Edit Appointment
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ADD COLOR FIELD */}
          <div>
            <Label htmlFor="color">Color (optional)</Label>
            <Input
              type="color"
              id="color"
              name="color"
              value={appointmentColor}
              onChange={(e) => setAppointmentColor(e.target.value)}
            />
          </div>

          {/* ... All other form inputs stay unchanged ... */}

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={updateAppointmentMutation.isPending} className="flex-1">
              {updateAppointmentMutation.isPending ? 'Updating...' : 'Update Appointment'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
