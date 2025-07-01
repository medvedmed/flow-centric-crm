
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Appointment } from '@/services/types';

interface AppointmentService {
  id: string;
  service_name: string;
  service_price: number;
  service_duration: number;
  staff_id?: string;
}

interface AppointmentServicesPanelProps {
  appointment: Appointment;
  appointmentServices: AppointmentService[];
}

export const AppointmentServicesPanel: React.FC<AppointmentServicesPanelProps> = ({
  appointment,
  appointmentServices
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newService, setNewService] = useState({ name: '', price: 0, duration: 60 });

  const totalServicePrice = appointmentServices.reduce((sum, service) => sum + Number(service.service_price), 0);
  const totalDuration = appointmentServices.reduce((sum, service) => sum + service.service_duration, 0);

  // Add service mutation
  const addServiceMutation = useMutation({
    mutationFn: async (service: { name: string; price: number; duration: number }) => {
      const { error } = await supabase
        .from('appointment_services')
        .insert({
          appointment_id: appointment?.id,
          service_name: service.name,
          service_price: service.price,
          service_duration: service.duration,
          staff_id: appointment?.staffId
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointment-services'] });
      toast({ title: 'Success', description: 'Service added successfully!' });
      setNewService({ name: '', price: 0, duration: 60 });
    },
  });

  // Remove service mutation
  const removeServiceMutation = useMutation({
    mutationFn: async (serviceId: string) => {
      const { error } = await supabase
        .from('appointment_services')
        .delete()
        .eq('id', serviceId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointment-services'] });
      toast({ title: 'Success', description: 'Service removed successfully!' });
    },
  });

  const handleAddService = () => {
    if (newService.name && newService.price > 0) {
      addServiceMutation.mutate(newService);
    }
  };

  return (
    <Card className="bg-white/70 backdrop-blur-sm border-violet-200">
      <CardHeader>
        <CardTitle>Additional Services</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {appointmentServices.map((service) => (
          <div key={service.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
            <div>
              <h4 className="font-medium">{service.service_name}</h4>
              <p className="text-sm text-gray-600">${service.service_price} • {service.service_duration} min</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeServiceMutation.mutate(service.id)}
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}

        <Separator />

        <div className="space-y-3">
          <h4 className="font-medium">Add New Service</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input
              placeholder="Service name"
              value={newService.name}
              onChange={(e) => setNewService({...newService, name: e.target.value})}
            />
            <Input
              type="number"
              placeholder="Price"
              value={newService.price}
              onChange={(e) => setNewService({...newService, price: Number(e.target.value)})}
            />
            <Input
              type="number"
              placeholder="Duration (min)"
              value={newService.duration}
              onChange={(e) => setNewService({...newService, duration: Number(e.target.value)})}
            />
          </div>
          <Button onClick={handleAddService} disabled={addServiceMutation.isPending}>
            <Plus className="w-4 h-4 mr-2" />
            Add Service
          </Button>
        </div>

        {appointmentServices.length > 0 && (
          <div className="pt-4 border-t">
            <div className="flex justify-between items-center">
              <span className="font-medium">Total Additional Services:</span>
              <span className="font-bold text-green-600">${totalServicePrice}</span>
            </div>
            <div className="flex justify-between items-center text-sm text-gray-600">
              <span>Total Duration:</span>
              <span>{totalDuration} minutes</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
