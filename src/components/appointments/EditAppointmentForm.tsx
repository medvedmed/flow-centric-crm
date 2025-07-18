import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Appointment } from '@/services/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Trash2, Plus, User, Calendar as CalendarIcon, DollarSign, Phone, Clock, FileText, CreditCard, UserCheck, Percent } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

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
  
  // State management
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(appointment?.date || new Date()));
  const [startTime, setStartTime] = useState(appointment?.start_time || '09:00');
  const [endTime, setEndTime] = useState(appointment?.end_time || '10:00');
  const [selectedService, setSelectedService] = useState(appointment?.service || '');
  const [serviceDuration, setServiceDuration] = useState(appointment?.duration || 60);
  const [servicePrice, setServicePrice] = useState(appointment?.price || 0);
  const [discount, setDiscount] = useState(0);
  const [selectedStaff, setSelectedStaff] = useState(appointment?.staff_id || '');
  const [isAttended, setIsAttended] = useState(appointment?.status === 'Completed');
  const [paymentAmount, setPaymentAmount] = useState(appointment?.paid_amount || 0);
  const [paymentMethod, setPaymentMethod] = useState(appointment?.payment_method || 'cash');
  const [paymentStatus, setPaymentStatus] = useState(appointment?.payment_status || 'unpaid');
  const [notes, setNotes] = useState(appointment?.notes || '');

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

  // Handle service selection
  const handleServiceChange = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    if (service) {
      setSelectedService(service.name);
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
      const updateData = {
        client_name: appointment.client_name,
        client_phone: appointment.client_phone,
        service: selectedService,
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
          notes: `Payment for ${selectedService}`,
        });

        // Create financial transaction
        await supabase.from('financial_transactions').insert({
          salon_id: user?.id,
          transaction_type: 'income',
          category: 'Service Revenue',
          amount: paymentAmount,
          description: `Payment for ${selectedService} - ${appointment.client_name}`,
          payment_method: paymentMethod,
          reference_id: appointment?.id,
          reference_type: 'appointment',
          transaction_date: format(selectedDate, 'yyyy-MM-dd'),
          created_by: user?.id
        });
      }

      // Update client retention stats if appointment is completed
      if (isAttended && appointment?.status !== 'Completed') {
        // This will be handled by the database trigger
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
    <div className="space-y-6">
      {/* Client Info (Read-only) */}
      <Card className="bg-muted/30">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="w-5 h-5" />
            Client Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Name</Label>
              <p className="text-lg font-semibold">{appointment.client_name}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Phone</Label>
              <p className="text-lg">{appointment.client_phone || 'Not provided'}</p>
            </div>
            {clientData?.email && (
              <div>
                <Label className="text-sm font-medium">Email</Label>
                <p className="text-sm text-muted-foreground">{clientData.email}</p>
              </div>
            )}
            {clientData?.status && (
              <div>
                <Label className="text-sm font-medium">Status</Label>
                <Badge variant={clientData.status === 'New' ? 'secondary' : 'default'}>
                  {clientData.status}
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Date/Time Pickers */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <CalendarIcon className="w-5 h-5" />
            Date & Time
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
          <div>
            <Label>Start Time</Label>
            <Input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>
          <div>
            <Label>End Time</Label>
            <Input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Service Row */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="w-5 h-5" />
            Service Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <div className="md:col-span-2">
              <Label>Service</Label>
              <Select value={services.find(s => s.name === selectedService)?.id || ''} onValueChange={handleServiceChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select service" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name} - ${service.price} ({service.duration}min)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Duration (min)</Label>
              <Input
                type="number"
                value={serviceDuration}
                onChange={(e) => setServiceDuration(Number(e.target.value))}
                min="1"
              />
            </div>
            <div>
              <Label>Price ($)</Label>
              <Input
                type="number"
                value={servicePrice}
                onChange={(e) => setServicePrice(Number(e.target.value))}
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <Label>Discount (%)</Label>
              <div className="flex items-center gap-2">
                <Percent className="w-4 h-4" />
                <Input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  min="0"
                  max="100"
                />
              </div>
            </div>
          </div>
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <div className="flex justify-between items-center">
              <span>Subtotal:</span>
              <span>${servicePrice.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between items-center text-red-600">
                <span>Discount ({discount}%):</span>
                <span>-${discountAmount.toFixed(2)}</span>
              </div>
            )}
            <Separator className="my-2" />
            <div className="flex justify-between items-center font-semibold text-lg">
              <span>Total:</span>
              <span>${finalTotal.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Staff Assignment & Attendance */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <UserCheck className="w-5 h-5" />
            Staff & Attendance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Assign Staff</Label>
            <Select value={selectedStaff} onValueChange={setSelectedStaff}>
              <SelectTrigger>
                <SelectValue placeholder="Select staff member" />
              </SelectTrigger>
              <SelectContent>
                {staff.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name} - {member.specialties?.join(', ') || 'All Services'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Mark as Attended</Label>
              <p className="text-sm text-muted-foreground">Client showed up for the appointment</p>
            </div>
            <Switch
              checked={isAttended}
              onCheckedChange={setIsAttended}
            />
          </div>
        </CardContent>
      </Card>

      {/* Payment Form */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <CreditCard className="w-5 h-5" />
            Payment Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Payment Amount</Label>
              <Input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(Number(e.target.value))}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <Label>Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method.id} value={method.name.toLowerCase()}>
                      {method.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Payment Status</Label>
              <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unpaid">Unpaid</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {paymentAmount > 0 && paymentAmount !== finalTotal && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                Payment amount (${paymentAmount.toFixed(2)}) differs from service total (${finalTotal.toFixed(2)})
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notes */}
      <div>
        <Label htmlFor="notes">Additional Notes</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any additional notes about the appointment..."
          rows={3}
        />
      </div>

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