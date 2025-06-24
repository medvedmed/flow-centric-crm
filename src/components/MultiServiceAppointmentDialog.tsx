
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { serviceApi } from '@/services/api/serviceApi';
import { clientApi } from '@/services/api/clientApi';
import { staffApi } from '@/services/api/staffApi';
import { enhancedAppointmentApi } from '@/services/api/enhancedAppointmentApi';
import { toast } from '@/hooks/use-toast';
import { Plus, X, Clock, DollarSign } from 'lucide-react';

interface MultiServiceAppointmentDialogProps {
  open: boolean;
  onClose: () => void;
  initialDate?: string;
  initialTime?: string;
}

interface SelectedService {
  id: string;
  name: string;
  price: number;
  duration: number;
}

export const MultiServiceAppointmentDialog: React.FC<MultiServiceAppointmentDialogProps> = ({
  open,
  onClose,
  initialDate,
  initialTime
}) => {
  const [appointmentData, setAppointmentData] = useState({
    client_id: '',
    client_name: '',
    client_phone: '',
    staff_id: '',
    date: initialDate || '',
    start_time: initialTime || '',
    notes: ''
  });

  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);
  const [availableServiceId, setAvailableServiceId] = useState('');

  const queryClient = useQueryClient();

  // Fetch data
  const { data: services } = useQuery({
    queryKey: ['services'],
    queryFn: () => serviceApi.getServices()
  });

  const { data: clients } = useQuery({
    queryKey: ['clients'],
    queryFn: () => clientApi.getClients()
  });

  const { data: staff } = useQuery({
    queryKey: ['staff'],
    queryFn: () => staffApi.getStaff()
  });

  // Create appointment mutation
  const createAppointmentMutation = useMutation({
    mutationFn: (data: { appointmentData: any; services: SelectedService[] }) =>
      enhancedAppointmentApi.createMultiServiceAppointment(data.appointmentData, data.services),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast({
        title: "Success",
        description: "Multi-service appointment created successfully",
      });
      handleClose();
    },
    onError: (error: any) => {
      console.error('Create appointment error:', error);
      toast({
        title: "Error", 
        description: error.message || "Failed to create appointment",
        variant: "destructive",
      });
    }
  });

  const addService = () => {
    if (!availableServiceId) return;

    const service = services?.data?.find(s => s.id === availableServiceId);
    if (!service) return;

    const isAlreadySelected = selectedServices.some(s => s.id === service.id);
    if (isAlreadySelected) {
      toast({
        title: "Service Already Selected",
        description: "This service is already added to the appointment",
        variant: "destructive",
      });
      return;
    }

    setSelectedServices(prev => [...prev, {
      id: service.id,
      name: service.name,
      price: Number(service.price),
      duration: service.duration
    }]);

    setAvailableServiceId('');
  };

  const removeService = (serviceId: string) => {
    setSelectedServices(prev => prev.filter(s => s.id !== serviceId));
  };

  const handleClientSelect = (clientId: string) => {
    const client = clients?.data?.find(c => c.id === clientId);
    if (client) {
      setAppointmentData(prev => ({
        ...prev,
        client_id: clientId,
        client_name: client.name,
        client_phone: client.phone || ''
      }));
    }
  };

  const calculateTotals = () => {
    const totalPrice = selectedServices.reduce((sum, service) => sum + service.price, 0);
    const totalDuration = selectedServices.reduce((sum, service) => sum + service.duration, 0);
    return { totalPrice, totalDuration };
  };

  const handleSubmit = () => {
    if (!appointmentData.client_name || !appointmentData.date || !appointmentData.start_time || selectedServices.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields and select at least one service",
        variant: "destructive",
      });
      return;
    }

    const { totalPrice, totalDuration } = calculateTotals();

    const completeAppointmentData = {
      ...appointmentData,
      price: totalPrice,
      duration: totalDuration,
      end_time: calculateEndTime(appointmentData.start_time, totalDuration),
      service: selectedServices.map(s => s.name).join(', '), // For backward compatibility
      status: 'Scheduled'
    };

    createAppointmentMutation.mutate({
      appointmentData: completeAppointmentData,
      services: selectedServices
    });
  };

  const calculateEndTime = (startTime: string, durationMinutes: number) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const startDate = new Date();
    startDate.setHours(hours, minutes);
    startDate.setMinutes(startDate.getMinutes() + durationMinutes);
    return startDate.toTimeString().slice(0, 5);
  };

  const handleClose = () => {
    setAppointmentData({
      client_id: '',
      client_name: '',
      client_phone: '',
      staff_id: '',
      date: initialDate || '',
      start_time: initialTime || '',
      notes: ''
    });
    setSelectedServices([]);
    setAvailableServiceId('');
    onClose();
  };

  const { totalPrice, totalDuration } = calculateTotals();

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Multi-Service Appointment</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Appointment Details */}
          <div className="space-y-4">
            <div>
              <Label>Client *</Label>
              <Select value={appointmentData.client_id} onValueChange={handleClientSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {clients?.data?.map(client => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name} - {client.phone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Client Name *</Label>
                <Input
                  value={appointmentData.client_name}
                  onChange={(e) => setAppointmentData(prev => ({ ...prev, client_name: e.target.value }))}
                  placeholder="Enter client name"
                />
              </div>
              <div>
                <Label>Client Phone</Label>
                <Input
                  value={appointmentData.client_phone}
                  onChange={(e) => setAppointmentData(prev => ({ ...prev, client_phone: e.target.value }))}
                  placeholder="Phone number"
                />
              </div>
            </div>

            <div>
              <Label>Staff Member</Label>
              <Select value={appointmentData.staff_id} onValueChange={(value) => setAppointmentData(prev => ({ ...prev, staff_id: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select staff member" />
                </SelectTrigger>
                <SelectContent>
                  {staff?.map(member => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Date *</Label>
                <Input
                  type="date"
                  value={appointmentData.date}
                  onChange={(e) => setAppointmentData(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
              <div>
                <Label>Start Time *</Label>
                <Input
                  type="time"
                  value={appointmentData.start_time}
                  onChange={(e) => setAppointmentData(prev => ({ ...prev, start_time: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label>Notes</Label>
              <Input
                value={appointmentData.notes}
                onChange={(e) => setAppointmentData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes..."
              />
            </div>
          </div>

          {/* Right Column - Services */}
          <div className="space-y-4">
            <div>
              <Label>Add Services</Label>
              <div className="flex gap-2">
                <Select value={availableServiceId} onValueChange={setAvailableServiceId}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select service to add" />
                  </SelectTrigger>
                  <SelectContent>
                    {services?.data?.map(service => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.name} - ${Number(service.price).toFixed(2)} ({service.duration}min)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={addService} disabled={!availableServiceId}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Selected Services */}
            <div>
              <Label>Selected Services ({selectedServices.length})</Label>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {selectedServices.map(service => (
                  <Card key={service.id}>
                    <CardContent className="p-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium">{service.name}</h4>
                          <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                              <DollarSign className="w-3 h-3" />
                              ${service.price.toFixed(2)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {service.duration}min
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeService(service.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {selectedServices.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    No services selected. Add services from the dropdown above.
                  </div>
                )}
              </div>
            </div>

            {/* Summary */}
            {selectedServices.length > 0 && (
              <Card className="bg-muted/50">
                <CardContent className="p-4">
                  <h4 className="font-medium mb-2">Appointment Summary</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Total Services:</span>
                      <Badge variant="secondary">{selectedServices.length}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Duration:</span>
                      <span>{totalDuration} minutes</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span>Total Price:</span>
                      <span>${totalPrice.toFixed(2)}</span>
                    </div>
                    {appointmentData.start_time && (
                      <div className="flex justify-between text-muted-foreground">
                        <span>Estimated End Time:</span>
                        <span>{calculateEndTime(appointmentData.start_time, totalDuration)}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={createAppointmentMutation.isPending || selectedServices.length === 0}
          >
            {createAppointmentMutation.isPending ? "Creating..." : "Create Appointment"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
