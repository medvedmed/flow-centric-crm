
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Appointment } from '@/services/types';
import { AppointmentTopBar } from './AppointmentTopBar';
import { ServiceRow } from './ServiceRow';
import { ProductRow } from './ProductRow';
import { ClientInfoSection } from './ClientInfoSection';
import { PaymentSection } from './PaymentSection';
import { format } from 'date-fns';

interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
}

interface EditAppointmentFormProps {
  appointment: Appointment | any;
  onClose: () => void;
}

export const EditAppointmentForm: React.FC<EditAppointmentFormProps> = ({
  appointment,
  onClose
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Add debug logging
  console.log('EditAppointmentForm - appointment data:', appointment);
  
  // State management
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(appointment?.date || new Date()));
  const [startTime, setStartTime] = useState(appointment?.start_time || '09:00');
  const [endTime, setEndTime] = useState(appointment?.end_time || '10:00');
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [serviceDuration, setServiceDuration] = useState(appointment?.duration || 60);
  const [servicePrice, setServicePrice] = useState(appointment?.price || 0);
  const [discount, setDiscount] = useState(0);
  const [selectedStaff, setSelectedStaff] = useState(appointment?.staff_id || '');
  const [isAttended, setIsAttended] = useState(appointment?.status === 'Completed');
  const [paymentAmount, setPaymentAmount] = useState(appointment?.paid_amount || 0);
  const [paymentMethod, setPaymentMethod] = useState(appointment?.payment_method || 'cash');
  const [paymentStatus, setPaymentStatus] = useState(appointment?.payment_status || 'unpaid');
  const [notes, setNotes] = useState(appointment?.notes || '');
  const [products, setProducts] = useState<any[]>([]);

  // Fetch services
  const { data: services = [] } = useQuery({
    queryKey: ['services'],
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
    enabled: !!user,
  });

  // Fetch staff
  const { data: staff = [] } = useQuery({
    queryKey: ['staff'],
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
    enabled: !!user,
  });

  // Fetch client info
  const { data: clientData } = useQuery({
    queryKey: ['client-info', appointment?.client_name],
    queryFn: async () => {
      if (!appointment?.client_name || !user?.id) return null;

      const { data: client } = await supabase
        .from('clients')
        .select('*')
        .eq('salon_id', user.id)
        .eq('name', appointment.client_name)
        .maybeSingle();

      return client;
    },
    enabled: !!appointment?.client_name && !!user?.id,
  });

  // Fetch payment methods
  const { data: paymentMethods = [] } = useQuery({
    queryKey: ['payment-methods'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('salon_id', user?.id)
        .eq('is_active', true)
        .order('name');
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Initialize form with appointment data
  useEffect(() => {
    if (appointment && services.length > 0) {
      console.log('Initializing form with appointment:', appointment);
      console.log('Available services:', services);
      
      // Find the service that matches the appointment's service name
      const matchedService = services.find(s => s.name === appointment.service);
      console.log('Matched service:', matchedService);
      
      if (matchedService) {
        setSelectedServiceId(matchedService.id);
        setServicePrice(appointment.price || matchedService.price);
        setServiceDuration(appointment.duration || matchedService.duration);
      } else {
        // If no service found, use the appointment data as-is
        setServicePrice(appointment.price || 0);
        setServiceDuration(appointment.duration || 60);
      }
    }
  }, [appointment, services]);

  // Handle service selection
  const handleServiceChange = (serviceId: string) => {
    console.log('Service changed to:', serviceId);
    const service = services.find(s => s.id === serviceId);
    if (service) {
      setSelectedServiceId(serviceId);
      setServicePrice(service.price);
      setServiceDuration(service.duration);
      // Auto-calculate end time based on duration
      const start = new Date(`2000-01-01 ${startTime}`);
      const end = new Date(start.getTime() + service.duration * 60000);
      setEndTime(end.toTimeString().slice(0, 5));
    }
  };

  // Calculate final total
  const discountAmount = (servicePrice * discount) / 100;
  const finalTotal = servicePrice - discountAmount;

  // Update appointment mutation
  const updateAppointmentMutation = useMutation({
    mutationFn: async () => {
      const selectedService = services.find(s => s.id === selectedServiceId);
      const serviceName = selectedService ? selectedService.name : appointment.service;
      
      const updateData = {
        client_name: appointment.client_name,
        client_phone: appointment.client_phone,
        service: serviceName,
        staff_id: selectedStaff,
        date: format(selectedDate, 'yyyy-MM-dd'),
        start_time: startTime,
        end_time: endTime,
        price: finalTotal,
        duration: serviceDuration,
        status: isAttended ? 'Completed' : 'Scheduled',
        notes: notes,
        payment_status: paymentStatus,
        payment_method: paymentMethod,
        paid_amount: paymentAmount,
        payment_date: paymentStatus === 'paid' ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      };

      const { data: updatedAppointment, error: appointmentError } = await supabase
        .from('appointments')
        .update(updateData)
        .eq('id', appointment?.id)
        .select()
        .single();

      if (appointmentError) throw appointmentError;

      // Create payment record if payment is made
      if (paymentStatus === 'paid' && paymentAmount > 0) {
        await supabase.from('client_payments').insert({
          salon_id: user?.id,
          client_id: clientData?.id,
          appointment_id: appointment?.id,
          amount: paymentAmount,
          payment_method: paymentMethod,
          payment_date: new Date().toISOString(),
          notes: `Payment for ${serviceName}`,
        });

        // Create financial transaction
        await supabase.from('financial_transactions').insert({
          salon_id: user?.id,
          transaction_type: 'income',
          category: 'Service Revenue',
          amount: paymentAmount,
          description: `Payment for ${serviceName} - ${appointment.client_name}`,
          payment_method: paymentMethod,
          reference_id: appointment?.id,
          reference_type: 'appointment',
          transaction_date: format(selectedDate, 'yyyy-MM-dd'),
          created_by: user?.id
        });
      }

      return updatedAppointment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['financial-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['client-payments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast({ title: 'Success', description: 'Appointment updated successfully!' });
      onClose();
    },
    onError: (error) => {
      console.error('Update appointment error:', error);
      toast({ title: 'Error', description: 'Failed to update appointment', variant: 'destructive' });
    },
  });

  return (
    <div className="space-y-6 p-6">
      {/* Top Bar - Staff, Date, Time */}
      <AppointmentTopBar
        selectedStaff={selectedStaff}
        onStaffChange={setSelectedStaff}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        startTime={startTime}
        onStartTimeChange={setStartTime}
        endTime={endTime}
        onEndTimeChange={setEndTime}
        staff={staff}
      />

      {/* Client Information */}
      <ClientInfoSection
        clientName={appointment?.client_name || 'Unknown Client'}
        clientPhone={appointment?.client_phone || 'No phone'}
        clientData={clientData}
        isAttended={isAttended}
        onAttendanceChange={setIsAttended}
      />

      {/* Service Row */}
      <ServiceRow
        selectedServiceId={selectedServiceId}
        onServiceChange={handleServiceChange}
        serviceDuration={serviceDuration}
        onDurationChange={setServiceDuration}
        servicePrice={servicePrice}
        onPriceChange={setServicePrice}
        discount={discount}
        onDiscountChange={setDiscount}
        services={services}
        appointmentService={appointment?.service}
      />

      {/* Product Row */}
      <ProductRow
        products={products}
        onProductsChange={setProducts}
      />

      {/* Payment Section */}
      <PaymentSection
        paymentAmount={paymentAmount}
        onPaymentAmountChange={setPaymentAmount}
        paymentMethod={paymentMethod}
        onPaymentMethodChange={setPaymentMethod}
        paymentStatus={paymentStatus}
        onPaymentStatusChange={setPaymentStatus}
        notes={notes}
        onNotesChange={setNotes}
        finalTotal={finalTotal}
        paymentMethods={paymentMethods}
      />

      {/* Actions */}
      <div className="flex gap-2 pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onClose}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button 
          onClick={() => updateAppointmentMutation.mutate()}
          disabled={updateAppointmentMutation.isPending} 
          className="flex-1"
        >
          {updateAppointmentMutation.isPending ? 'Updating...' : 'Update Appointment'}
        </Button>
      </div>
    </div>
  );
};
