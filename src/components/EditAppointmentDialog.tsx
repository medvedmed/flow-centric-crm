
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash2, Calendar, Clock, User, DollarSign, CreditCard } from 'lucide-react';
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
  const [paymentStatus, setPaymentStatus] = useState(appointment?.payment_status || 'unpaid');
  const [paymentMethod, setPaymentMethod] = useState(appointment?.payment_method || 'cash');

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

  // Load existing extra services for the appointment
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
    if (existingExtraServices.length > 0) {
      setExtraServices(existingExtraServices);
    }
    if (appointment) {
      setPaymentStatus(appointment.payment_status || 'unpaid');
      setPaymentMethod(appointment.payment_method || 'cash');
    }
  }, [existingExtraServices, appointment]);

  const updateAppointmentMutation = useMutation({
    mutationFn: async (appointmentData: any) => {
      const { data: updatedAppointment, error: appointmentError } = await supabase
        .from('appointments')
        .update({
          ...appointmentData,
          payment_status: paymentStatus,
          payment_method: paymentMethod,
          payment_date: paymentStatus === 'paid' ? new Date().toISOString() : null
        })
        .eq('id', appointment?.id)
        .select()
        .single();
      
      if (appointmentError) throw appointmentError;

      // Handle extra services
      if (extraServices.length > 0) {
        // Delete existing extra services
        await supabase
          .from('appointment_services')
          .delete()
          .eq('appointment_id', appointment?.id);

        // Insert new extra services
        const serviceInserts = extraServices.map(service => ({
          appointment_id: appointment?.id,
          service_name: service.name,
          service_price: service.price,
          service_duration: service.duration,
          staff_id: appointmentData.staff_id
        }));

        const { error: servicesError } = await supabase
          .from('appointment_services')
          .insert(serviceInserts);
        
        if (servicesError) throw servicesError;

        // Update appointment total price
        const totalExtraPrice = extraServices.reduce((sum, service) => sum + service.price, 0);
        const { error: priceUpdateError } = await supabase
          .from('appointments')
          .update({
            price: appointmentData.price + totalExtraPrice
          })
          .eq('id', appointment?.id);
        
        if (priceUpdateError) throw priceUpdateError;
      }

      // Create financial transaction if payment status changed to paid
      if (paymentStatus === 'paid' && appointment?.payment_status !== 'paid') {
        const totalPrice = appointmentData.price + extraServices.reduce((sum, service) => sum + service.price, 0);
        
        const { error: transactionError } = await supabase
          .from('financial_transactions')
          .insert({
            salon_id: user?.id,
            transaction_type: 'income',
            category: 'Service Revenue',
            amount: totalPrice,
            description: `Payment for ${appointmentData.service} - ${appointmentData.client_name}`,
            payment_method: paymentMethod,
            reference_id: appointment?.id,
            reference_type: 'appointment',
            transaction_date: new Date().toISOString().split('T')[0],
            created_by: user?.id
          });
        
        if (transactionError) {
          console.error('Error creating financial transaction:', transactionError);
        }
      }

      return updatedAppointment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['enhanced-schedule-appointments'] });
      queryClient.invalidateQueries({ queryKey: ['financial-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast({ title: "Success", description: "Appointment updated successfully!" });
      onClose();
      setExtraServices([]);
    },
    onError: (error) => {
      toast({ title: "Error", description: "Failed to update appointment", variant: "destructive" });
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

  const totalExtraPrice = extraServices.reduce((sum, service) => sum + service.price, 0);
  const totalExtraDuration = extraServices.reduce((sum, service) => sum + service.duration, 0);

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
          {/* Client Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="client_name">Client Name</Label>
              <Input
                id="client_name"
                name="client_name"
                defaultValue={appointment.clientName}
                required
              />
            </div>
            <div>
              <Label htmlFor="client_phone">Client Phone</Label>
              <Input
                id="client_phone"
                name="client_phone"
                defaultValue={appointment.clientPhone || ''}
                type="tel"
              />
            </div>
          </div>

          {/* Service and Staff */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="service">Main Service</Label>
              <Input
                id="service"
                name="service"
                defaultValue={appointment.service}
                required
              />
            </div>
            <div>
              <Label htmlFor="staff_id">Staff Member</Label>
              <Select name="staff_id" defaultValue={appointment.staffId || ''}>
                <SelectTrigger>
                  <SelectValue placeholder="Select staff..." />
                </SelectTrigger>
                <SelectContent>
                  {staff.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                name="date"
                type="date"
                defaultValue={appointment.date}
                required
              />
            </div>
            <div>
              <Label htmlFor="start_time">Start Time</Label>
              <Input
                id="start_time"
                name="start_time"
                type="time"
                defaultValue={appointment.startTime}
                required
              />
            </div>
            <div>
              <Label htmlFor="end_time">End Time</Label>
              <Input
                id="end_time"
                name="end_time"
                type="time"
                defaultValue={appointment.endTime}
                required
              />
            </div>
          </div>

          {/* Pricing and Duration */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="price">Base Price ($)</Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                defaultValue={appointment.price}
                required
              />
            </div>
            <div>
              <Label htmlFor="duration">Duration (min)</Label>
              <Input
                id="duration"
                name="duration"
                type="number"
                defaultValue={appointment.duration}
                required
              />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select name="status" defaultValue={appointment.status}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Scheduled">Scheduled</SelectItem>
                  <SelectItem value="Confirmed">Confirmed</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                  <SelectItem value="No Show">No Show</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Extra Services */}
          <div>
            <Label className="text-base font-semibold">Extra Services</Label>
            <div className="flex gap-2 mt-2">
              <Select onValueChange={addExtraService}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Add extra service..." />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem 
                      key={service.id} 
                      value={service.id}
                      disabled={extraServices.some(s => s.id === service.id)}
                    >
                      {service.name} - ${service.price} ({service.duration}min)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {extraServices.length > 0 && (
              <div className="mt-4 space-y-2">
                <Label className="text-sm">Added Services:</Label>
                {extraServices.map((service) => (
                  <div key={service.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <span className="font-medium">{service.name}</span>
                      <span className="text-sm text-gray-500 ml-2">
                        {service.duration} minutes
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">${service.price}</Badge>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeExtraService(service.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                <div className="flex justify-between items-center font-semibold pt-2 border-t">
                  <span>Extra Services Total:</span>
                  <div className="flex items-center gap-4">
                    <span>${totalExtraPrice.toFixed(2)}</span>
                    <span className="text-sm text-gray-500">+{totalExtraDuration}min</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Payment Information */}
          <div>
            <Label className="text-base font-semibold flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Payment Information
            </Label>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div>
                <Label htmlFor="payment_status">Payment Status</Label>
                <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unpaid">Unpaid</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="partial">Partial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="payment_method">Payment Method</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="transfer">Bank Transfer</SelectItem>
                    <SelectItem value="mobile">Mobile Payment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              defaultValue={appointment.notes || ''}
              rows={3}
            />
          </div>

          {/* Total Summary */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex justify-between items-center text-lg font-semibold">
              <span>Total Amount:</span>
              <span>${(appointment.price + totalExtraPrice).toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-sm text-gray-600 mt-1">
              <span>Total Duration:</span>
              <span>{appointment.duration + totalExtraDuration} minutes</span>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="submit"
              disabled={updateAppointmentMutation.isPending}
              className="flex-1"
            >
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
