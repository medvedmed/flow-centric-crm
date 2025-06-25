import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Calendar } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Appointment } from '@/services/types';
import { ClientInfoSection } from './appointment/ClientInfoSection';
import { ServiceDetailsSection } from './appointment/ServiceDetailsSection';
import { SchedulingSection } from './appointment/SchedulingSection';
import { PaymentSection } from './appointment/PaymentSection';
import { NotesSection } from './appointment/NotesSection';

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
  
  // Form state
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [selectedStaff, setSelectedStaff] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [basePrice, setBasePrice] = useState(0);
  const [baseDuration, setBaseDuration] = useState(60);
  const [status, setStatus] = useState<Appointment['status']>('Scheduled');
  const [notes, setNotes] = useState('');
  const [appointmentColor, setAppointmentColor] = useState('#007bff');
  const [paymentStatus, setPaymentStatus] = useState<'paid' | 'unpaid' | 'partial'>('unpaid');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [extraServices, setExtraServices] = useState<ExtraService[]>([]);

  // Queries for services, staff, and existing extra services
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

  // Initialize form with appointment data
  useEffect(() => {
    if (appointment) {
      setClientName(appointment.clientName || '');
      setClientPhone(appointment.clientPhone || '');
      setSelectedService(appointment.service || '');
      setSelectedStaff(appointment.staffId || '');
      setAppointmentDate(appointment.date || '');
      setStartTime(appointment.startTime || '');
      setEndTime(appointment.endTime || '');
      setBasePrice(appointment.price || 0);
      setBaseDuration(appointment.duration || 60);
      setStatus(appointment.status || 'Scheduled');
      setNotes(appointment.notes || '');
      setAppointmentColor(appointment.color || '#007bff');
      setPaymentStatus(appointment.paymentStatus || 'unpaid');
      setPaymentMethod(appointment.paymentMethod || 'cash');
      setExtraServices(existingExtraServices);
    }
  }, [appointment, existingExtraServices]);

  // Service selection handler
  const handleServiceSelect = (serviceName: string) => {
    const service = services.find(s => s.name === serviceName);
    if (service) {
      setSelectedService(serviceName);
      setBasePrice(service.price);
      setBaseDuration(service.duration);
      
      // Auto-calculate end time
      if (startTime) {
        const [hours, minutes] = startTime.split(':').map(Number);
        const startDate = new Date();
        startDate.setHours(hours, minutes);
        const endDate = new Date(startDate.getTime() + (service.duration + totalExtraDuration) * 60000);
        setEndTime(`${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`);
      }
    }
  };

  // Add extra service
  const addExtraService = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    if (service && !extraServices.find(s => s.id === serviceId)) {
      setExtraServices(prev => [...prev, service]);
    }
  };

  // Remove extra service
  const removeExtraService = (serviceId: string) => {
    setExtraServices(prev => prev.filter(s => s.id !== serviceId));
  };

  // Calculations
  const totalExtraPrice = extraServices.reduce((sum, service) => sum + Number(service.price || 0), 0);
  const totalExtraDuration = extraServices.reduce((sum, service) => sum + Number(service.duration || 0), 0);
  const finalTotalPrice = Number(basePrice || 0) + totalExtraPrice;
  const finalTotalDuration = Number(baseDuration || 0) + totalExtraDuration;

  const updateAppointmentMutation = useMutation({
    mutationFn: async () => {
      const { data: updatedAppointment, error: appointmentError } = await supabase
        .from('appointments')
        .update({
          client_name: clientName,
          client_phone: clientPhone,
          service: selectedService,
          staff_id: selectedStaff,
          date: appointmentDate,
          start_time: startTime,
          end_time: endTime,
          price: finalTotalPrice,
          duration: finalTotalDuration,
          status: status,
          notes: notes,
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

      // Handle extra services
      if (extraServices.length > 0) {
        await supabase.from('appointment_services').delete().eq('appointment_id', appointment?.id);

        const serviceInserts = extraServices.map(service => ({
          appointment_id: appointment?.id,
          service_name: service.name,
          service_price: Number(service.price),
          service_duration: Number(service.duration),
          staff_id: selectedStaff
        }));

        const { error: servicesError } = await supabase.from('appointment_services').insert(serviceInserts);
        if (servicesError) throw servicesError;
      } else {
        await supabase.from('appointment_services').delete().eq('appointment_id', appointment?.id);
      }

      // Handle payment transaction
      if (paymentStatus === 'paid' && appointment?.paymentStatus !== 'paid') {
        await supabase.from('financial_transactions').insert({
          salon_id: user?.id,
          transaction_type: 'income',
          category: 'Service Revenue',
          amount: finalTotalPrice,
          description: `Payment for ${selectedService} - ${clientName}`,
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
      console.error('Update error:', error);
      toast({ title: 'Error', description: 'Failed to update appointment', variant: 'destructive' });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateAppointmentMutation.mutate();
  };

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
          {/* Client Information Section */}
          <ClientInfoSection
            clientName={clientName}
            clientPhone={clientPhone}
            onClientNameChange={setClientName}
            onClientPhoneChange={setClientPhone}
          />

          <Separator />

          {/* Service Details Section */}
          <ServiceDetailsSection
            selectedService={selectedService}
            selectedStaff={selectedStaff}
            basePrice={basePrice}
            baseDuration={baseDuration}
            extraServices={extraServices}
            services={services}
            staff={staff}
            finalTotalPrice={finalTotalPrice}
            finalTotalDuration={finalTotalDuration}
            onServiceSelect={handleServiceSelect}
            onStaffSelect={setSelectedStaff}
            onBasePriceChange={setBasePrice}
            onBaseDurationChange={setBaseDuration}
            onAddExtraService={addExtraService}
            onRemoveExtraService={removeExtraService}
          />

          <Separator />

          {/* Scheduling Section */}
          <SchedulingSection
            appointmentDate={appointmentDate}
            startTime={startTime}
            endTime={endTime}
            status={status}
            appointmentColor={appointmentColor}
            onDateChange={setAppointmentDate}
            onStartTimeChange={setStartTime}
            onEndTimeChange={setEndTime}
            onStatusChange={setStatus}
            onColorChange={setAppointmentColor}
          />

          <Separator />

          {/* Payment Section */}
          <PaymentSection
            paymentStatus={paymentStatus}
            paymentMethod={paymentMethod}
            onPaymentStatusChange={setPaymentStatus}
            onPaymentMethodChange={setPaymentMethod}
          />

          <Separator />

          {/* Notes Section */}
          <NotesSection
            notes={notes}
            onNotesChange={setNotes}
          />

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
