
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { X, Plus, Calendar, Clock, User, Scissors } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabaseApi } from '@/services/supabaseApi';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
  category: string;
}

interface Staff {
  id: string;
  name: string;
  specialties?: string[];
}

interface Client {
  id: string;
  name: string;
  phone?: string;
  email: string;
}

interface SelectedService {
  serviceId: string;
  name: string;
  price: number;
  duration: number;
  staffId?: string;
}

interface CreateAppointmentService {
  service_name: string;
  service_price: number;
  service_duration: number;
  staff_id?: string;
}

interface MultiServiceAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate?: Date;
  selectedTime?: string;
  selectedStaffId?: string;
}

export const MultiServiceAppointmentDialog: React.FC<MultiServiceAppointmentDialogProps> = ({
  open,
  onOpenChange,
  selectedDate = new Date(),
  selectedTime = '09:00',
  selectedStaffId
}) => {
  const [clientId, setClientId] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);
  const [appointmentDate, setAppointmentDate] = useState(format(selectedDate, 'yyyy-MM-dd'));
  const [appointmentTime, setAppointmentTime] = useState(selectedTime);
  const [notes, setNotes] = useState('');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch services, staff, and clients
  const { data: services = [] } = useQuery({
    queryKey: ['services'],
    queryFn: supabaseApi.getServices
  });

  const { data: staff = [] } = useQuery({
    queryKey: ['staff'],
    queryFn: supabaseApi.getStaff
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: supabaseApi.getClients
  });

  const createAppointmentMutation = useMutation({
    mutationFn: async (appointmentData: any) => {
      const response = await supabaseApi.createAppointment(appointmentData);
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Multi-service appointment created successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      onOpenChange(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create appointment",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setClientId('');
    setClientName('');
    setClientPhone('');
    setSelectedServices([]);
    setAppointmentDate(format(selectedDate, 'yyyy-MM-dd'));
    setAppointmentTime(selectedTime);
    setNotes('');
  };

  const addService = () => {
    setSelectedServices([...selectedServices, {
      serviceId: '',
      name: '',
      price: 0,
      duration: 60,
      staffId: selectedStaffId || ''
    }]);
  };

  const removeService = (index: number) => {
    setSelectedServices(selectedServices.filter((_, i) => i !== index));
  };

  const updateService = (index: number, field: keyof SelectedService, value: any) => {
    const updated = [...selectedServices];
    if (field === 'serviceId' && value) {
      const service = services.find(s => s.id === value);
      if (service) {
        updated[index] = {
          ...updated[index],
          serviceId: value,
          name: service.name,
          price: service.price,
          duration: service.duration
        };
      }
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setSelectedServices(updated);
  };

  const calculateTotal = () => {
    return selectedServices.reduce((total, service) => total + service.price, 0);
  };

  const calculateTotalDuration = () => {
    return selectedServices.reduce((total, service) => total + service.duration, 0);
  };

  const handleSubmit = async () => {
    if (!clientId && !clientName) {
      toast({
        title: "Error",
        description: "Please select or enter a client",
        variant: "destructive",
      });
      return;
    }

    if (selectedServices.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one service",
        variant: "destructive",
      });
      return;
    }

    const appointmentServices: CreateAppointmentService[] = selectedServices.map(service => ({
      service_name: service.name,
      service_price: service.price,
      service_duration: service.duration,
      staff_id: service.staffId || undefined
    }));

    const appointmentData = {
      client_id: clientId || undefined,
      client_name: clientName || clients.find(c => c.id === clientId)?.name || '',
      client_phone: clientPhone || clients.find(c => c.id === clientId)?.phone || '',
      date: appointmentDate,
      start_time: appointmentTime,
      end_time: calculateEndTime(appointmentTime, calculateTotalDuration()),
      service: selectedServices.map(s => s.name).join(', '),
      price: calculateTotal(),
      duration: calculateTotalDuration(),
      staff_id: selectedServices[0]?.staffId || selectedStaffId || undefined,
      notes,
      status: 'Scheduled',
      services: appointmentServices
    };

    createAppointmentMutation.mutate(appointmentData);
  };

  const calculateEndTime = (startTime: string, duration: number) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + duration;
    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scissors className="w-5 h-5" />
            Multi-Service Appointment
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column - Client & Appointment Details */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Client Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="client">Select Client</Label>
                    <Select value={clientId} onValueChange={setClientId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose existing client" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.name} - {client.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="text-center text-sm text-muted-foreground">or</div>
                  
                  <div>
                    <Label htmlFor="clientName">New Client Name</Label>
                    <Input
                      id="clientName"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="Enter client name"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="clientPhone">Phone Number</Label>
                    <Input
                      id="clientPhone"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Appointment Details
                </h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={appointmentDate}
                      onChange={(e) => setAppointmentDate(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="time">Start Time</Label>
                    <Input
                      id="time"
                      type="time"
                      value={appointmentTime}
                      onChange={(e) => setAppointmentTime(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label>Total Duration</Label>
                    <div className="text-sm text-muted-foreground">
                      {calculateTotalDuration()} minutes
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Additional notes..."
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Services */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Scissors className="w-4 h-4" />
                    Services
                  </h3>
                  <Button onClick={addService} variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-1" />
                    Add Service
                  </Button>
                </div>

                <div className="space-y-4">
                  {selectedServices.map((selectedService, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Service {index + 1}</span>
                        <Button
                          onClick={() => removeService(index)}
                          variant="ghost"
                          size="sm"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <div>
                        <Label>Service</Label>
                        <Select
                          value={selectedService.serviceId}
                          onValueChange={(value) => updateService(index, 'serviceId', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Choose service" />
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
                        <Label>Staff Member</Label>
                        <Select
                          value={selectedService.staffId}
                          onValueChange={(value) => updateService(index, 'staffId', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Choose staff member" />
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
                      
                      <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                        <div>Price: ${selectedService.price}</div>
                        <div>Duration: {selectedService.duration}min</div>
                      </div>
                    </div>
                  ))}
                  
                  {selectedServices.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      Click "Add Service" to start building your appointment
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {selectedServices.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2">Appointment Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Total Services:</span>
                      <span>{selectedServices.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Duration:</span>
                      <span>{calculateTotalDuration()} minutes</span>
                    </div>
                    <div className="flex justify-between font-semibold">
                      <span>Total Price:</span>
                      <span>${calculateTotal().toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={createAppointmentMutation.isPending || selectedServices.length === 0}
          >
            {createAppointmentMutation.isPending ? 'Creating...' : 'Create Appointment'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
