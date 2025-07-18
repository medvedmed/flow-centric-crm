
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Appointment } from '@/services/types';
import { AppointmentBasicInfo } from './AppointmentBasicInfo';
import { AppointmentDateTime } from './AppointmentDateTime';
import { AppointmentPricing } from './AppointmentPricing';
import { AppointmentExtraServices } from './AppointmentExtraServices';
import { AppointmentStatus } from './AppointmentStatus';
import { AppointmentSummary } from './AppointmentSummary';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Trash2, Plus, User, Calendar, DollarSign, Phone, Clock, MapPin, FileText, CreditCard } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

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

interface EditAppointmentFormProps {
  appointment: Appointment | any; // Allow for database snake_case properties
  onClose: () => void;
}

export const EditAppointmentForm: React.FC<EditAppointmentFormProps> = ({
  appointment,
  onClose
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [extraServices, setExtraServices] = useState<ExtraService[]>([]);
  const [paymentStatus, setPaymentStatus] = useState<'paid' | 'unpaid' | 'partial'>('unpaid');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [basePrice, setBasePrice] = useState(appointment?.price || 0);
  const [appointmentColor, setAppointmentColor] = useState('#007bff');
  const [showProductSection, setShowProductSection] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);
  const [clientInfo, setClientInfo] = useState<any>(null);

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
    enabled: !!user,
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
    enabled: !!user,
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products-for-appointment'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('salon_id', user?.id)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data;
    },
    enabled: !!user,
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
    enabled: !!appointment?.id,
  });

  // Fetch client information and appointment history
  const { data: clientData } = useQuery({
    queryKey: ['client-info', appointment?.client_name],
    queryFn: async () => {
      if (!appointment?.client_name || !user?.id) return null;

      // Get client basic info
      const { data: client } = await supabase
        .from('clients')
        .select('*')
        .eq('salon_id', user.id)
        .eq('name', appointment.client_name)
        .maybeSingle();

      // Get client appointment history
      const { data: appointmentHistory } = await supabase
        .from('appointments')
        .select('*')
        .eq('salon_id', user.id)
        .eq('client_name', appointment.client_name)
        .order('date', { ascending: false })
        .limit(5);

      // Calculate client stats
      const { data: allAppointments } = await supabase
        .from('appointments')
        .select('price, status, date')
        .eq('salon_id', user.id)
        .eq('client_name', appointment.client_name);

      const totalSpent = allAppointments?.filter(a => a.status === 'Completed').reduce((sum, a) => sum + (a.price || 0), 0) || 0;
      const totalVisits = allAppointments?.filter(a => a.status === 'Completed').length || 0;
      const lastVisit = allAppointments?.filter(a => a.status === 'Completed').sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]?.date;

      return {
        client,
        appointmentHistory: appointmentHistory || [],
        stats: {
          totalSpent,
          totalVisits,
          lastVisit
        }
      };
    },
    enabled: !!appointment?.client_name && !!user?.id,
  });

  useEffect(() => {
    if (appointment) {
      setExtraServices(existingExtraServices);
      setPaymentStatus(
        (appointment.payment_status || appointment.paymentStatus) && (appointment.payment_status || appointment.paymentStatus).trim() !== '' 
          ? (appointment.payment_status || appointment.paymentStatus) as 'paid' | 'unpaid' | 'partial'
          : 'unpaid'
      );
      setPaymentMethod(
        (appointment.payment_method || appointment.paymentMethod) && (appointment.payment_method || appointment.paymentMethod).trim() !== '' 
          ? (appointment.payment_method || appointment.paymentMethod)
          : 'cash'
      );
      setBasePrice(appointment.price || 0);
      setAppointmentColor(
        appointment.color && appointment.color.trim() !== '' 
          ? appointment.color 
          : '#007bff'
      );
    }
  }, [appointment, existingExtraServices]);

  const updateAppointmentMutation = useMutation({
    mutationFn: async (appointmentData: any) => {
      const totalExtraPrice = extraServices.reduce((sum, service) => sum + Number(service.price), 0);
      const finalPrice = Number(appointmentData.price) + totalExtraPrice;

      const updateData = {
        client_name: appointmentData.client_name,
        client_phone: appointmentData.client_phone,
        service: appointmentData.service,
        staff_id: appointmentData.staff_id,
        date: appointmentData.date,
        start_time: appointmentData.start_time,
        end_time: appointmentData.end_time,
        price: finalPrice,
        duration: appointmentData.duration + extraServices.reduce((sum, service) => sum + Number(service.duration), 0),
        status: appointmentData.status,
        notes: appointmentData.notes,
        payment_status: paymentStatus,
        payment_method: paymentMethod,
        payment_date: paymentStatus === 'paid' ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
        color: appointmentColor
      };

      const { data: updatedAppointment, error: appointmentError } = await supabase
        .from('appointments')
        .update(updateData)
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
          staff_id: appointmentData.staff_id
        }));

        const { error: servicesError } = await supabase.from('appointment_services').insert(serviceInserts);
        if (servicesError) throw servicesError;
      } else {
        await supabase.from('appointment_services').delete().eq('appointment_id', appointment?.id);
      }

      // Handle product sales
      if (selectedProducts.length > 0) {
        await supabase.from('appointment_products').delete().eq('appointment_id', appointment?.id);
        
        const productInserts = selectedProducts.map(product => ({
          appointment_id: appointment?.id,
          product_id: product.id,
          quantity: product.quantity,
          unit_price: product.selling_price,
          total_price: product.selling_price * product.quantity
        }));

        const { error: productsError } = await supabase.from('appointment_products').insert(productInserts);
        if (productsError) throw productsError;

        // Update product inventory
        for (const product of selectedProducts) {
          const { error: inventoryError } = await supabase
            .from('products')
            .update({ 
              current_stock: product.current_stock - product.quantity,
              updated_at: new Date().toISOString()
            })
            .eq('id', product.id);
          
          if (inventoryError) throw inventoryError;
        }
      }

      if (paymentStatus === 'paid' && (appointment?.payment_status !== 'paid' && appointment?.paymentStatus !== 'paid')) {
        const productTotal = selectedProducts.reduce((sum, p) => sum + (p.selling_price * p.quantity), 0);
        const totalWithProducts = finalPrice + productTotal;
        
        await supabase.from('financial_transactions').insert({
          salon_id: user?.id,
          transaction_type: 'income',
          category: 'Service Revenue',
          amount: totalWithProducts,
          description: `Payment for ${appointmentData.service} - ${appointmentData.client_name}${selectedProducts.length > 0 ? ' (includes products)' : ''}`,
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
      console.error('Update appointment error:', error);
      toast({ title: 'Error', description: 'Failed to update appointment', variant: 'destructive' });
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

  const addProduct = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product && !selectedProducts.find(p => p.id === productId)) {
      setSelectedProducts(prev => [...prev, { ...product, quantity: 1 }]);
    }
  };

  const removeProduct = (productId: string) => {
    setSelectedProducts(prev => prev.filter(p => p.id !== productId));
  };

  const updateProductQuantity = (productId: string, quantity: number) => {
    setSelectedProducts(prev => prev.map(p => 
      p.id === productId ? { ...p, quantity: Math.max(1, quantity) } : p
    ));
  };

  const totalExtraPrice = extraServices.reduce((sum, service) => sum + Number(service.price || 0), 0);
  const totalExtraDuration = extraServices.reduce((sum, service) => sum + Number(service.duration || 0), 0);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <AppointmentBasicInfo
        clientName={appointment.client_name || appointment.clientName}
        clientPhone={appointment.client_phone || appointment.clientPhone || ''}
        service={appointment.service}
        staffId={appointment.staff_id || appointment.staffId || ''}
        services={services}
        staff={staff}
      />

      {/* Client Information Section */}
      {clientData && (
        <Card className="bg-muted/30">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="w-5 h-5" />
              Client Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Client Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2 p-3 bg-background rounded-lg border">
                <Calendar className="w-4 h-4 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Visits</p>
                  <p className="font-semibold">{clientData.stats.totalVisits}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-background rounded-lg border">
                <DollarSign className="w-4 h-4 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Spent</p>
                  <p className="font-semibold">${clientData.stats.totalSpent.toFixed(2)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-background rounded-lg border">
                <Calendar className="w-4 h-4 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Last Visit</p>
                  <p className="font-semibold">
                    {clientData.stats.lastVisit 
                      ? new Date(clientData.stats.lastVisit).toLocaleDateString()
                      : 'First visit'
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Client Details */}
            {clientData.client && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="text-sm text-muted-foreground">{clientData.client.email || 'Not provided'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <Badge variant={clientData.client.status === 'New' ? 'secondary' : 'default'}>
                    {clientData.client.status || 'Active'}
                  </Badge>
                </div>
                {clientData.client.preferred_stylist && (
                  <div>
                    <Label className="text-sm font-medium">Preferred Stylist</Label>
                    <p className="text-sm text-muted-foreground">{clientData.client.preferred_stylist}</p>
                  </div>
                )}
                {clientData.client.notes && (
                  <div className="md:col-span-2">
                    <Label className="text-sm font-medium">Client Notes</Label>
                    <p className="text-sm text-muted-foreground">{clientData.client.notes}</p>
                  </div>
                )}
              </div>
            )}

            {/* Recent Appointment History */}
            {clientData.appointmentHistory.length > 0 && (
              <div>
                <Label className="text-sm font-medium mb-2 block">Recent Appointments</Label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {clientData.appointmentHistory.slice(0, 3).map((appt: any) => (
                    <div key={appt.id} className="flex justify-between items-center p-2 bg-background rounded border text-sm">
                      <div>
                        <span className="font-medium">{appt.service}</span>
                        <span className="text-muted-foreground ml-2">
                          {new Date(appt.date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={appt.status === 'Completed' ? 'default' : 'secondary'} className="text-xs">
                          {appt.status}
                        </Badge>
                        {appt.price && <span className="text-muted-foreground">${appt.price}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Current Appointment Details */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="w-5 h-5" />
            Appointment Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Appointment Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-2 p-3 bg-background rounded-lg border">
              <Clock className="w-4 h-4 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="font-semibold">{appointment.duration || 60} mins</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-background rounded-lg border">
              <DollarSign className="w-4 h-4 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Base Price</p>
                <p className="font-semibold">${(appointment.price || 0).toFixed(2)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-background rounded-lg border">
              <FileText className="w-4 h-4 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge variant={appointment.status === 'Completed' ? 'default' : 'secondary'}>
                  {appointment.status || 'Scheduled'}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-background rounded-lg border">
              <CreditCard className="w-4 h-4 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Payment</p>
                <Badge variant={paymentStatus === 'paid' ? 'default' : 'secondary'}>
                  {paymentStatus || 'unpaid'}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Appointment Timeline */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Appointment Time</Label>
              <div className="flex items-center gap-2 mt-1">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">
                  {appointment.start_time || appointment.startTime} - {appointment.end_time || appointment.endTime}
                </span>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">Date</Label>
              <div className="flex items-center gap-2 mt-1">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">
                  {new Date(appointment.date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Staff Information */}
          {appointment.staff_id && (
            <div>
              <Label className="text-sm font-medium">Assigned Staff</Label>
              <div className="flex items-center gap-2 mt-1">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">
                  {staff.find(s => s.id === appointment.staff_id)?.name || 'Staff Member'}
                </span>
              </div>
            </div>
          )}

          {/* Service Information */}
          <div>
            <Label className="text-sm font-medium">Service Details</Label>
            <div className="mt-2 p-3 bg-background rounded-lg border">
              <div className="flex justify-between items-center">
                <span className="font-medium">{appointment.service}</span>
                <span className="text-muted-foreground">${(appointment.price || 0).toFixed(2)}</span>
              </div>
              {extraServices.length > 0 && (
                <div className="mt-2 pt-2 border-t">
                  <p className="text-xs text-muted-foreground mb-1">Extra Services:</p>
                  {extraServices.map((service, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <span>{service.name}</span>
                      <span className="text-muted-foreground">${service.price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Created/Updated Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-muted-foreground">
            <div>
              <span>Created: </span>
              {appointment.created_at 
                ? new Date(appointment.created_at).toLocaleString()
                : 'N/A'
              }
            </div>
            <div>
              <span>Last Updated: </span>
              {appointment.updated_at 
                ? new Date(appointment.updated_at).toLocaleString()
                : 'N/A'
              }
            </div>
          </div>
        </CardContent>
      </Card>

      <AppointmentDateTime
        date={appointment.date}
        startTime={appointment.start_time || appointment.startTime}
        endTime={appointment.end_time || appointment.endTime}
      />

      <AppointmentPricing
        price={basePrice}
        duration={appointment.duration || 60}
        onPriceChange={setBasePrice}
      />

      <AppointmentExtraServices
        services={services}
        extraServices={extraServices}
        onAddService={addExtraService}
        onRemoveService={removeExtraService}
      />

      {/* Product Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Products</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowProductSection(!showProductSection)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Products
          </Button>
        </div>

        {showProductSection && (
          <Card className="p-4">
            <div className="space-y-4">
              <Select onValueChange={addProduct}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name} - ${product.selling_price} (Stock: {product.current_stock})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedProducts.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Selected Products:</Label>
                  {selectedProducts.map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">{product.name}</span>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="1"
                          max={product.current_stock}
                          value={product.quantity}
                          onChange={(e) => updateProductQuantity(product.id, parseInt(e.target.value))}
                          className="w-16 h-8"
                        />
                        <span className="text-sm">${(product.selling_price * product.quantity).toFixed(2)}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeProduct(product.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        )}
      </div>

      <AppointmentStatus
        status={appointment.status}
        paymentStatus={paymentStatus}
        paymentMethod={paymentMethod}
        appointmentColor={appointmentColor}
        onPaymentStatusChange={setPaymentStatus}
        onPaymentMethodChange={setPaymentMethod}
        onColorChange={setAppointmentColor}
      />

      {/* Notes */}
      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          name="notes"
          defaultValue={appointment.notes || ''}
          placeholder="Additional notes..."
          rows={3}
        />
      </div>

      <AppointmentSummary
        basePrice={basePrice}
        extraServicesPrice={totalExtraPrice}
        productsPrice={selectedProducts.reduce((sum, p) => sum + (p.selling_price * p.quantity), 0)}
        totalDuration={(appointment.duration || 60) + totalExtraDuration}
      />

      <div className="flex gap-2 pt-4">
        <Button 
          type="button" 
          variant="outline" 
          className="flex-1"
          onClick={() => {
            // Logic for scheduling/booking another appointment
            toast({ title: 'Schedule', description: 'Opening schedule view...' });
            // You can navigate to schedule or open schedule dialog here
          }}
        >
          Schedule
        </Button>
        <Button type="submit" disabled={updateAppointmentMutation.isPending} className="flex-1">
          {updateAppointmentMutation.isPending ? 'Updating...' : 'Update Appointment'}
        </Button>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </form>
  );
};
