
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
import { Calendar, Clock, User, DollarSign, Plus, Trash2, Download } from 'lucide-react';
import { ReceiptGenerator } from './ReceiptGenerator';

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
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [servicesData, clientsData] = await Promise.all([
        serviceApi.getServices(),
        clientApi.getClients()
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

  const handleUpdateAppointment = async () => {
    try {
      setIsUpdating(true);
      
      const updateData = {
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

      // Refresh the appointment data
      const refreshedAppointments = await appointmentApi.getAppointments();
      const updatedAppointment = Array.isArray(refreshedAppointments) 
        ? refreshedAppointments.find(apt => apt.id === appointment.id)
        : (refreshedAppointments as any)?.data?.find((apt: any) => apt.id === appointment.id);
      
      if (updatedAppointment) {
        setFormData(updatedAppointment);
      }

      // Close the dialog after a short delay to show the success message
      setTimeout(() => {
        onClose();
        // Force a page refresh to update the calendar
        window.location.reload();
      }, 1000);

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

  const addProduct = () => {
    setProducts([...products, { 
      id: Date.now().toString(), 
      name: '', 
      quantity: 1, 
      price: 0 
    }]);
  };

  const removeProduct = (index: number) => {
    setProducts(products.filter((_, i) => i !== index));
  };

  const updateProduct = (index: number, field: string, value: any) => {
    const updatedProducts = [...products];
    updatedProducts[index] = { ...updatedProducts[index], [field]: value };
    setProducts(updatedProducts);
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

  const totalAmount = formData.price + products.reduce((sum, product) => sum + (product.price * product.quantity), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
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
        {/* Left Column - Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Client Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
              <Label htmlFor="service">Service</Label>
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

        {/* Right Column - Schedule & Payment */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Schedule & Payment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
              <>
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
                {formData.paymentDate && (
                  <div>
                    <Label htmlFor="paymentDate">Payment Date</Label>
                    <Input
                      id="paymentDate"
                      type="datetime-local"
                      value={formData.paymentDate ? new Date(formData.paymentDate).toISOString().slice(0, 16) : ''}
                      onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                    />
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Products Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Additional Products
            </CardTitle>
            <Button onClick={addProduct} variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No additional products added</p>
          ) : (
            <div className="space-y-3">
              {products.map((product, index) => (
                <div key={product.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <Input
                    placeholder="Product name"
                    value={product.name}
                    onChange={(e) => updateProduct(index, 'name', e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    placeholder="Qty"
                    value={product.quantity}
                    onChange={(e) => updateProduct(index, 'quantity', parseInt(e.target.value) || 1)}
                    className="w-20"
                  />
                  <Input
                    type="number"
                    placeholder="Price"
                    value={product.price}
                    onChange={(e) => updateProduct(index, 'price', parseFloat(e.target.value) || 0)}
                    className="w-24"
                  />
                  <Button
                    onClick={() => removeProduct(index)}
                    variant="outline"
                    size="sm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notes Section */}
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

      {/* Summary & Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-lg font-semibold">
              Total Amount: ${totalAmount.toFixed(2)}
            </div>
            <div className="flex items-center gap-3">
              <ReceiptGenerator appointment={formData} />
              <Button
                onClick={handleUpdateAppointment}
                disabled={isUpdating}
                className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700"
              >
                {isUpdating ? 'Updating...' : 'Update Appointment'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
