import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { appointmentApi } from '@/services/api/appointmentApi';
import { serviceApi } from '@/services/api/serviceApi';
import { clientApi } from '@/services/api/clientApi';
import { Appointment, Service, Client } from '@/services/types';
import { Calendar, Clock, User, DollarSign, Download, CheckCircle } from 'lucide-react';
import { ReceiptGenerator } from './ReceiptGenerator';
import { ClientSelector } from '../ClientSelector';
import { AppointmentServicesManager } from './AppointmentServicesManager';
import { AppointmentProductsManager } from './AppointmentProductsManager';
import { useAppointmentDetails } from '@/hooks/appointments/useAppointmentDetails';
import { supabase } from '@/integrations/supabase/client';

interface EditAppointmentFormProps {
  appointment: Appointment;
  onClose: () => void;
}

export const EditAppointmentForm: React.FC<EditAppointmentFormProps> = ({
  appointment,
  onClose
}) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<Appointment>(appointment);
  const [services, setServices] = useState<Service[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);

  // Load appointment details including services and products
  const { data: appointmentDetails, refetch: refetchDetails } = useAppointmentDetails(appointment.id);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Auto-populate client data when appointment has client_id
    if (appointment.clientId && clients.length > 0) {
      const client = clients.find(c => c.id === appointment.clientId);
      if (client) {
        setSelectedClient(client);
        setFormData(prev => ({
          ...prev,
          clientName: client.name,
          clientPhone: client.phone || ''
        }));
      }
    }
  }, [appointment.clientId, clients]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [servicesData, clientsData, productsData] = await Promise.all([
        serviceApi.getServices(),
        clientApi.getClients(),
        loadProducts()
      ]);
      
      if (Array.isArray(servicesData)) {
        setServices(servicesData);
      } else if (servicesData?.data) {
        setServices(servicesData.data);
      }
      
      if (Array.isArray(clientsData)) {
        setClients(clientsData);
      } else if (clientsData?.data) {
        setClients(clientsData.data);
      }

      setProducts(productsData || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load form data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error loading products:', error);
      return [];
    }
  };

  const handleClientSelect = (client: Client) => {
    setSelectedClient(client);
    setFormData(prev => ({
      ...prev,
      clientId: client.id,
      clientName: client.name,
      clientPhone: client.phone || ''
    }));
  };

  const handleNewClient = async (clientData: { name: string; email: string; phone?: string }) => {
    try {
      setFormData(prev => ({
        ...prev,
        clientName: clientData.name,
        clientPhone: clientData.phone || ''
      }));
      
      toast({
        title: "Client Added",
        description: "New client information has been added to the appointment",
      });
    } catch (error) {
      console.error('Error creating client:', error);
      toast({
        title: "Error",
        description: "Failed to create new client",
        variant: "destructive",
      });
    }
  };

  const handleUpdateAppointment = async () => {
    try {
      setIsUpdating(true);
      
      const updateData = {
        clientId: selectedClient?.id || formData.clientId,
        clientName: formData.clientName,
        clientPhone: formData.clientPhone,
        service: formData.service,
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        duration: formData.duration,
        price: formData.price,
        status: formData.status,
        paymentStatus: formData.paymentStatus,
        paymentMethod: formData.paymentMethod,
        notes: formData.notes,
        staffId: formData.staffId
      };

      await appointmentApi.updateAppointment(appointment.id, updateData);
      
      toast({
        title: "Success",
        description: "Appointment updated successfully",
      });

      // Refresh details
      await refetchDetails();

    } catch (error) {
      console.error('Error updating appointment:', error);
      toast({
        title: "Error",
        description: "Failed to update appointment",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleFinalizeSale = async () => {
    try {
      setIsFinalizing(true);

      // Calculate total with services and products
      const servicesTotal = appointmentDetails?.services.reduce((sum, service) => sum + Number(service.service_price), 0) || 0;
      const productsTotal = appointmentDetails?.products.reduce((sum, product) => sum + Number(product.total_price), 0) || 0;
      const finalTotal = formData.price + servicesTotal + productsTotal;

      // Update appointment as completed and paid
      const updateData = {
        status: 'Completed' as const,
        paymentStatus: 'paid' as const,
        paymentMethod: formData.paymentMethod || 'cash',
        paymentDate: new Date().toISOString(),
        price: finalTotal
      };

      await appointmentApi.updateAppointment(appointment.id, updateData);
      
      toast({
        title: "Sale Finalized",
        description: `Appointment completed and payment of $${finalTotal.toFixed(2)} recorded!`,
      });

      // Close dialog and refresh
      setTimeout(() => {
        onClose();
        window.location.reload();
      }, 1500);

    } catch (error) {
      console.error('Error finalizing sale:', error);
      toast({
        title: "Error",
        description: "Failed to finalize sale",
        variant: "destructive",
      });
    } finally {
      setIsFinalizing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'Scheduled': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'No Show': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800 border-green-200';
      case 'partial': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'unpaid': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const servicesTotal = appointmentDetails?.services.reduce((sum, service) => sum + Number(service.service_price), 0) || 0;
  const productsTotal = appointmentDetails?.products.reduce((sum, product) => sum + Number(product.total_price), 0) || 0;
  const grandTotal = formData.price + servicesTotal + productsTotal;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header - keep existing code */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calendar className="w-6 h-6 text-violet-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Edit Appointment</h2>
            <p className="text-gray-600">
              ID: {formData.id} • Created: {new Date(formData.createdAt || '').toLocaleDateString()}
            </p>
            <p className="text-sm text-gray-500">
              Last updated: {new Date(formData.updatedAt || '').toLocaleString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={getStatusColor(formData.status)} variant="outline">
            {formData.status}
          </Badge>
          <Badge className={getPaymentStatusColor(formData.paymentStatus)} variant="outline">
            {formData.paymentStatus}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Client Information - keep existing code */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Client Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ClientSelector
              selectedClientId={selectedClient?.id}
              onClientSelect={handleClientSelect}
              onNewClient={handleNewClient}
            />
            
            <div>
              <Label htmlFor="clientName">Client Name</Label>
              <Input
                id="clientName"
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="clientPhone">Phone Number</Label>
              <Input
                id="clientPhone"
                value={formData.clientPhone || ''}
                onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="service">Main Service</Label>
              <Select
                value={formData.service}
                onValueChange={(value) => {
                  const selectedService = services.find(s => s.name === value);
                  setFormData({
                    ...formData,
                    service: value,
                    price: selectedService?.price || formData.price,
                    duration: selectedService?.duration || formData.duration
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.name}>
                      {service.name} - ${service.price}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Right Column - Schedule & Payment - keep existing basic structure */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Schedule & Payment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* ... keep existing schedule and payment fields ... */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Service Price</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label htmlFor="duration">Duration (min)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 60 })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: "Scheduled" | "Confirmed" | "In Progress" | "Completed" | "Cancelled" | "No Show") => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Scheduled">Scheduled</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                    <SelectItem value="No Show">No Show</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="paymentStatus">Payment Status</Label>
                <Select
                  value={formData.paymentStatus}
                  onValueChange={(value: "paid" | "partial" | "unpaid") => setFormData({ ...formData, paymentStatus: value })}
                >
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
            {formData.paymentStatus !== 'unpaid' && (
              <div>
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Select
                  value={formData.paymentMethod || 'cash'}
                  onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="transfer">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Services Management */}
      <AppointmentServicesManager
        appointmentId={appointment.id}
        appointmentServices={appointmentDetails?.services || []}
        availableServices={services}
        onServicesChange={refetchDetails}
      />

      {/* Enhanced Products Management */}
      <AppointmentProductsManager
        appointmentId={appointment.id}
        appointmentProducts={appointmentDetails?.products || []}
        availableProducts={products}
        onProductsChange={refetchDetails}
      />

      {/* Notes Section - keep existing */}
      <Card>
        <CardHeader>
          <CardTitle>Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={formData.notes || ''}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Add any additional notes..."
            rows={3}
          />
        </CardContent>
      </Card>

      {/* Enhanced Summary & Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Detailed Breakdown */}
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span>Main Service:</span>
                <span>${formData.price.toFixed(2)}</span>
              </div>
              {servicesTotal > 0 && (
                <div className="flex justify-between">
                  <span>Additional Services:</span>
                  <span>${servicesTotal.toFixed(2)}</span>
                </div>
              )}
              {productsTotal > 0 && (
                <div className="flex justify-between">
                  <span>Products:</span>
                  <span>${productsTotal.toFixed(2)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-lg font-semibold">
                <span>Grand Total:</span>
                <span>${grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ReceiptGenerator appointment={formData} />
              </div>
              <div className="flex items-center gap-3">
                <Button
                  onClick={handleUpdateAppointment}
                  disabled={isUpdating}
                  variant="outline"
                >
                  {isUpdating ? 'Updating...' : 'Save Changes'}
                </Button>
                <Button
                  onClick={handleFinalizeSale}
                  disabled={isFinalizing}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {isFinalizing ? 'Finalizing...' : `Finalize Sale ($${grandTotal.toFixed(2)})`}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
