
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Calendar, Clock, User } from 'lucide-react';
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
  const [additionalServices, setAdditionalServices] = useState<Array<{
    id: string;
    name: string;
    price: number;
    duration: number;
  }>>([]);

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

  const updateAppointmentMutation = useMutation({
    mutationFn: async (appointmentData: any) => {
      const { data: updatedAppointment, error: appointmentError } = await supabase
        .from('appointments')
        .update(appointmentData)
        .eq('id', appointment?.id)
        .select()
        .single();
      
      if (appointmentError) throw appointmentError;

      // Handle additional services
      if (additionalServices.length > 0) {
        // Delete existing additional services
        await supabase
          .from('appointment_services')
          .delete()
          .eq('appointment_id', appointment?.id);

        // Insert new additional services
        const serviceInserts = additionalServices.map(service => ({
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
        const totalAdditionalPrice = additionalServices.reduce((sum, service) => sum + service.price, 0);
        const { error: priceUpdateError } = await supabase
          .from('appointments')
          .update({
            price: appointmentData.price + totalAdditionalPrice
          })
          .eq('id', appointment?.id);
        
        if (priceUpdateError) throw priceUpdateError;
      }

      return updatedAppointment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['enhanced-schedule-appointments'] });
      toast({ title: "Success", description: "Appointment updated successfully!" });
      onClose();
      setAdditionalServices([]);
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

  const addService = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    if (service && !additionalServices.find(s => s.id === serviceId)) {
      setAdditionalServices(prev => [...prev, service]);
    }
  };

  const removeService = (serviceId: string) => {
    setAdditionalServices(prev => prev.filter(s => s.id !== serviceId));
  };

  const totalAdditionalPrice = additionalServices.reduce((sum, service) => sum + service.price, 0);

  if (!appointment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Edit Appointment
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="service">Service</Label>
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

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="price">Price ($)</Label>
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

          <div>
            <Label>Additional Services</Label>
            <div className="flex gap-2 mt-2">
              <Select onValueChange={addService}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Add extra service..." />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem 
                      key={service.id} 
                      value={service.id}
                      disabled={additionalServices.some(s => s.id === service.id)}
                    >
                      {service.name} - ${service.price}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {additionalServices.length > 0 && (
              <div className="mt-4 space-y-2">
                <Label className="text-sm">Added Services:</Label>
                {additionalServices.map((service) => (
                  <div key={service.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span>{service.name}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">${service.price}</Badge>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeService(service.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                <div className="flex justify-between items-center font-semibold pt-2 border-t">
                  <span>Additional Total:</span>
                  <span>${totalAdditionalPrice.toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              defaultValue={appointment.notes || ''}
              rows={3}
            />
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
