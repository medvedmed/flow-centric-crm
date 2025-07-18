import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
}

interface AppointmentService {
  id: string;
  service_name: string;
  service_price: number;
  service_duration: number;
}

interface AppointmentServicesManagerProps {
  appointmentId: string;
  appointmentServices: AppointmentService[];
  availableServices: Service[];
  onServicesChange: () => void;
}

export const AppointmentServicesManager: React.FC<AppointmentServicesManagerProps> = ({
  appointmentId,
  appointmentServices,
  availableServices,
  onServicesChange
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedServiceId, setSelectedServiceId] = useState('');

  const addServiceMutation = useMutation({
    mutationFn: async (serviceId: string) => {
      const service = availableServices.find(s => s.id === serviceId);
      if (!service) throw new Error('Service not found');

      const { error } = await supabase
        .from('appointment_services')
        .insert({
          appointment_id: appointmentId,
          service_name: service.name,
          service_price: service.price,
          service_duration: service.duration
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointment-details'] });
      onServicesChange();
      setSelectedServiceId('');
      toast({ title: 'Success', description: 'Service added successfully!' });
    },
    onError: (error) => {
      console.error('Error adding service:', error);
      toast({ title: 'Error', description: 'Failed to add service', variant: 'destructive' });
    }
  });

  const removeServiceMutation = useMutation({
    mutationFn: async (serviceId: string) => {
      const { error } = await supabase
        .from('appointment_services')
        .delete()
        .eq('id', serviceId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointment-details'] });
      onServicesChange();
      toast({ title: 'Success', description: 'Service removed successfully!' });
    },
    onError: (error) => {
      console.error('Error removing service:', error);
      toast({ title: 'Error', description: 'Failed to remove service', variant: 'destructive' });
    }
  });

  const totalServicesPrice = appointmentServices.reduce((sum, service) => sum + Number(service.service_price), 0);
  const totalDuration = appointmentServices.reduce((sum, service) => sum + service.service_duration, 0);

  const handleAddService = () => {
    if (selectedServiceId) {
      addServiceMutation.mutate(selectedServiceId);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Additional Services
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Existing Services */}
        {appointmentServices.map((service) => (
          <div key={service.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
            <div>
              <h4 className="font-medium">{service.service_name}</h4>
              <p className="text-sm text-gray-600">${service.service_price} • {service.service_duration} min</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeServiceMutation.mutate(service.id)}
              disabled={removeServiceMutation.isPending}
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}

        {appointmentServices.length === 0 && (
          <p className="text-gray-500 text-center py-4">No additional services added</p>
        )}

        <Separator />

        {/* Add New Service */}
        <div className="space-y-3">
          <h4 className="font-medium">Add Service</h4>
          <div className="flex gap-3">
            <Select value={selectedServiceId} onValueChange={setSelectedServiceId}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select a service to add" />
              </SelectTrigger>
              <SelectContent>
                {availableServices
                  .filter(service => !appointmentServices.find(as => as.service_name === service.name))
                  .map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name} - ${service.price} ({service.duration}min)
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <Button 
              onClick={handleAddService} 
              disabled={!selectedServiceId || addServiceMutation.isPending}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add
            </Button>
          </div>
        </div>

        {/* Services Summary */}
        {appointmentServices.length > 0 && (
          <div className="pt-4 border-t bg-blue-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium">Additional Services Total:</span>
              <span className="font-bold text-blue-600">${totalServicesPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-sm text-gray-600">
              <span>Total Additional Duration:</span>
              <span>{totalDuration} minutes</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
