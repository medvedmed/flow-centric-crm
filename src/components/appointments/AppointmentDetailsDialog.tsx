import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Clock, User, Phone, Calendar, CreditCard, Trash2, Edit3, DollarSign } from 'lucide-react';
import { Appointment } from '@/services/types';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';

interface AppointmentService {
  id: string;
  service_name: string;
  service_price: number;
  service_duration: number;
  staff_id?: string;
}

interface AppointmentDetailsDialogProps {
  appointment: Appointment | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AppointmentDetailsDialog: React.FC<AppointmentDetailsDialogProps> = ({
  appointment,
  isOpen,
  onClose
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editedAppointment, setEditedAppointment] = useState<Partial<Appointment>>({});
  const [newService, setNewService] = useState({ name: '', price: 0, duration: 60 });

  // Fetch appointment services
  const { data: appointmentServices = [] } = useQuery({
    queryKey: ['appointment-services', appointment?.id],
    queryFn: async () => {
      if (!appointment?.id) return [];
      
      const { data, error } = await supabase
        .from('appointment_services')
        .select('*')
        .eq('appointment_id', appointment.id);

      if (error) throw error;
      return data as AppointmentService[];
    },
    enabled: !!appointment?.id,
  });

  // Fetch payment methods
  const { data: paymentMethods = [] } = useQuery({
    queryKey: ['payment-methods'],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('salon_id', user.id)
        .eq('is_active', true);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  useEffect(() => {
    if (appointment) {
      setEditedAppointment(appointment);
    }
  }, [appointment]);

  // Update appointment mutation
  const updateAppointmentMutation = useMutation({
    mutationFn: async (updates: Partial<Appointment>) => {
      const { error } = await supabase
        .from('appointments')
        .update(updates)
        .eq('id', appointment?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast({ title: 'Success', description: 'Appointment updated successfully!' });
      setIsEditing(false);
    },
    onError: (error) => {
      toast({ title: 'Error', description: 'Failed to update appointment', variant: 'destructive' });
    },
  });

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

  const handleSave = () => {
    updateAppointmentMutation.mutate(editedAppointment);
  };

  const handleAddService = () => {
    if (newService.name && newService.price > 0) {
      addServiceMutation.mutate(newService);
    }
  };

  const totalServicePrice = appointmentServices.reduce((sum, service) => sum + Number(service.service_price), 0);
  const totalDuration = appointmentServices.reduce((sum, service) => sum + service.service_duration, 0);

  if (!appointment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white to-violet-50">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
              Appointment Details
            </DialogTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              className="border-violet-200"
            >
              <Edit3 className="w-4 h-4 mr-2" />
              {isEditing ? 'Cancel' : 'Edit'}
            </Button>
          </div>
        </DialogHeader>

        <Tabs defaultValue="details" className="space-y-6">
          <TabsList className="bg-white/70 backdrop-blur-sm">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="payment">Quick Payment</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <Card className="bg-white/70 backdrop-blur-sm border-violet-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-violet-600" />
                  Client Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Client Name</Label>
                    {isEditing ? (
                      <Input
                        value={editedAppointment.clientName || ''}
                        onChange={(e) => setEditedAppointment({...editedAppointment, clientName: e.target.value})}
                      />
                    ) : (
                      <p className="font-medium">{appointment.clientName}</p>
                    )}
                  </div>
                  <div>
                    <Label>Phone</Label>
                    {isEditing ? (
                      <Input
                        value={editedAppointment.clientPhone || ''}
                        onChange={(e) => setEditedAppointment({...editedAppointment, clientPhone: e.target.value})}
                      />
                    ) : (
                      <p className="font-medium">{appointment.clientPhone || 'N/A'}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur-sm border-violet-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-violet-600" />
                  Appointment Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Service</Label>
                    {isEditing ? (
                      <Input
                        value={editedAppointment.service || ''}
                        onChange={(e) => setEditedAppointment({...editedAppointment, service: e.target.value})}
                      />
                    ) : (
                      <p className="font-medium">{appointment.service}</p>
                    )}
                  </div>
                  <div>
                    <Label>Status</Label>
                    {isEditing ? (
                      <Select
                        value={editedAppointment.status}
                        onValueChange={(value) => setEditedAppointment({...editedAppointment, status: value as any})}
                      >
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
                    ) : (
                      <Badge variant="secondary">{appointment.status}</Badge>
                    )}
                  </div>
                  <div>
                    <Label>Date & Time</Label>
                    <p className="font-medium">{appointment.date} {appointment.startTime} - {appointment.endTime}</p>
                  </div>
                  <div>
                    <Label>Price</Label>
                    <p className="font-medium text-green-600">${appointment.price}</p>
                  </div>
                </div>
                
                <div>
                  <Label>Notes</Label>
                  {isEditing ? (
                    <Textarea
                      value={editedAppointment.notes || ''}
                      onChange={(e) => setEditedAppointment({...editedAppointment, notes: e.target.value})}
                      placeholder="Add notes..."
                    />
                  ) : (
                    <p className="text-gray-600">{appointment.notes || 'No notes'}</p>
                  )}
                </div>

                {isEditing && (
                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleSave} disabled={updateAppointmentMutation.isPending}>
                      Save Changes
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="services" className="space-y-4">
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
          </TabsContent>

          <TabsContent value="payment">
            <QuickPaymentPanel 
              appointment={appointment} 
              appointmentServices={appointmentServices}
              paymentMethods={paymentMethods}
              onPaymentComplete={() => {
                queryClient.invalidateQueries({ queryKey: ['appointments'] });
                queryClient.invalidateQueries({ queryKey: ['financial-transactions'] });
              }}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

// Quick Payment Panel Component
interface QuickPaymentPanelProps {
  appointment: Appointment;
  appointmentServices: AppointmentService[];
  paymentMethods: any[];
  onPaymentComplete: () => void;
}

const QuickPaymentPanel: React.FC<QuickPaymentPanelProps> = ({
  appointment,
  appointmentServices,
  paymentMethods,
  onPaymentComplete
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tipAmount, setTipAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<Array<{id: string; name: string; price: number; quantity: number}>>([]);

  const basePrice = Number(appointment.price) || 0;
  const servicesPrice = appointmentServices.reduce((sum, service) => sum + Number(service.service_price), 0);
  const productsPrice = selectedProducts.reduce((sum, product) => sum + (product.price * product.quantity), 0);
  const totalAmount = basePrice + servicesPrice + productsPrice + tipAmount;

  const processPaymentMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('No user');

      // Update appointment payment status
      const { error: appointmentError } = await supabase
        .from('appointments')
        .update({
          payment_status: 'paid',
          payment_method: paymentMethod,
          payment_date: new Date().toISOString()
        })
        .eq('id', appointment.id);

      if (appointmentError) throw appointmentError;

      // Create financial transaction
      const { error: transactionError } = await supabase
        .from('financial_transactions')
        .insert({
          salon_id: user.id,
          transaction_type: 'income',
          category: 'Service Revenue',
          amount: totalAmount,
          description: `Payment for ${appointment.service} - ${appointment.clientName}${tipAmount > 0 ? ` (includes $${tipAmount} tip)` : ''}`,
          payment_method: paymentMethod,
          transaction_date: new Date().toISOString().split('T')[0]
        });

      if (transactionError) throw transactionError;
    },
    onSuccess: () => {
      toast({ title: 'Success', description: 'Payment processed successfully!' });
      onPaymentComplete();
    },
    onError: (error) => {
      toast({ title: 'Error', description: 'Failed to process payment', variant: 'destructive' });
    },
  });

  return (
    <Card className="bg-white/70 backdrop-blur-sm border-violet-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-violet-600" />
          Quick Payment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <div className="flex justify-between">
            <span>Base Service:</span>
            <span>${basePrice}</span>
          </div>
          
          {appointmentServices.length > 0 && (
            <div className="flex justify-between">
              <span>Additional Services:</span>
              <span>${servicesPrice}</span>
            </div>
          )}

          <div className="space-y-2">
            <Label>Tip Amount</Label>
            <Input
              type="number"
              value={tipAmount}
              onChange={(e) => setTipAmount(Number(e.target.value))}
              placeholder="0.00"
            />
          </div>

          <div className="space-y-2">
            <Label>Payment Method</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map((method) => (
                  <SelectItem key={method.id} value={method.name}>
                    {method.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="flex justify-between text-lg font-bold">
            <span>Total Amount:</span>
            <span className="text-green-600">${totalAmount.toFixed(2)}</span>
          </div>

          <Button
            className="w-full bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700"
            onClick={() => processPaymentMutation.mutate()}
            disabled={!paymentMethod || processPaymentMutation.isPending}
          >
            <DollarSign className="w-4 h-4 mr-2" />
            Process Payment
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
