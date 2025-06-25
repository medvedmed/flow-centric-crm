
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
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <h3 className="font-semibold">Client Information</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="clientName">Client Name</Label>
                <Input
                  id="clientName"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="clientPhone">Client Phone</Label>
                <Input
                  id="clientPhone"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Service Details Section */}
          <div className="space-y-4">
            <h3 className="font-semibold">Service Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="service">Service</Label>
                <Select value={selectedService} onValueChange={handleServiceSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a service" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((service) => (
                      <SelectItem key={service.id} value={service.name}>
                        {service.name} - ${service.price} ({service.duration}min)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="staff">Staff</Label>
                <Select value={selectedStaff} onValueChange={setSelectedStaff}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select staff member" />
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

            {/* Extra Services */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Extra Services</Label>
                <Select onValueChange={addExtraService}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Add extra service" />
                  </SelectTrigger>
                  <SelectContent>
                    {services
                      .filter(s => !extraServices.find(es => es.id === s.id))
                      .map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          <Plus className="w-3 h-3 mr-1" />
                          {service.name} - ${service.price}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              
              {extraServices.length > 0 && (
                <div className="space-y-2">
                  {extraServices.map((service) => (
                    <div key={service.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{service.name}</Badge>
                        <span className="text-sm text-gray-600">${service.price} • {service.duration}min</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeExtraService(service.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="basePrice">Base Price</Label>
                <Input
                  id="basePrice"
                  type="number"
                  value={basePrice}
                  onChange={(e) => setBasePrice(Number(e.target.value))}
                  step="0.01"
                />
              </div>
              <div>
                <Label htmlFor="baseDuration">Base Duration (minutes)</Label>
                <Input
                  id="baseDuration"
                  type="number"
                  value={baseDuration}
                  onChange={(e) => setBaseDuration(Number(e.target.value))}
                />
              </div>
            </div>

            {/* Totals */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Total Price:</span>
                <span className="text-lg font-bold">${finalTotalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="font-semibold">Total Duration:</span>
                <span className="text-lg font-bold">{finalTotalDuration} minutes</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Scheduling Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <h3 className="font-semibold">Scheduling</h3>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={(value: Appointment['status']) => setStatus(value)}>
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
              <div>
                <Label htmlFor="color">Appointment Color</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="color"
                    type="color"
                    value={appointmentColor}
                    onChange={(e) => setAppointmentColor(e.target.value)}
                    className="w-20 h-10"
                  />
                  <Palette className="w-4 h-4 text-gray-500" />
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Payment Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              <h3 className="font-semibold">Payment</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="paymentStatus">Payment Status</Label>
                <Select value={paymentStatus} onValueChange={(value: 'paid' | 'unpaid' | 'partial') => setPaymentStatus(value)}>
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
              <div>
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="transfer">Bank Transfer</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          {/* Notes Section */}
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional notes..."
              rows={3}
            />
          </div>

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
