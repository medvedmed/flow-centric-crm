import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { appointmentApi } from '@/services/api/appointmentApi';
import { serviceApi } from '@/services/api/serviceApi';
import { clientApi } from '@/services/api/clientApi';
import { Appointment, Service, Client } from '@/services/types';
import { Calendar, Clock, User, DollarSign, Plus, Trash2 } from 'lucide-react';
import { ReceiptGenerator } from './ReceiptGenerator';
import { ClientSelector } from '../ClientSelector';

interface EditAppointmentFormProps {
  appointment: Appointment;
  onClose: () => void;
}

export const EditAppointmentForm: React.FC<EditAppointmentFormProps> = ({
  appointment,
  onClose
}) => {
  const { toast } = useToast();

  // Local state for the form
  const [formData, setFormData] = useState<Appointment>(appointment);
  const [services, setServices] = useState<Service[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // 1) Load master data once
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [svcs, clnts] = await Promise.all([
          serviceApi.getServices(),
          clientApi.getClients()
        ]);
        setServices(Array.isArray(svcs) ? svcs : svcs.data);
        setClients(Array.isArray(clnts) ? clnts : clnts.data);
      } catch (err) {
        console.error(err);
        toast({
          title: 'Error',
          description: 'Failed to load services or clients',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [toast]);

  // 2) Once appointment + lookups are ready, populate EVERY field at once
  useEffect(() => {
    if (!appointment || services.length === 0 || clients.length === 0) return;

    // find the full client & service objects
    const client = clients.find(c => c.id === appointment.clientId);
    const service = services.find(s => s.id === appointment.serviceId);

    // set selection
    setSelectedClient(client || null);

    // seed formData with all appointment values + lookups
    setFormData({
      ...appointment,
      clientName:    client?.name        || appointment.clientName,
      clientPhone:   client?.phone       || appointment.clientPhone,
      service:       service?.name       || appointment.service,
      price:         service?.price      ?? appointment.price,
      duration:      service?.duration   ?? appointment.duration,
      date:          appointment.date,
      startTime:     appointment.startTime,
      endTime:       appointment.endTime,
      status:        appointment.status,
      paymentStatus: appointment.paymentStatus,
      paymentMethod: appointment.paymentMethod,
      notes:         appointment.notes,
      staffId:       appointment.staffId,
      // copy any other fields you use here...
    });
  }, [appointment, services, clients]);

  // Handlers
  const handleClientSelect = (client: Client) => {
    setSelectedClient(client);
    setFormData(f => ({
      ...f,
      clientId:    client.id,
      clientName:  client.name,
      clientPhone: client.phone || ''
    }));
  };

  const handleNewClient = async (data: { name: string; email: string; phone?: string }) => {
    // your "create client then add to appointment" logic…
    toast({ title: 'Client Added', description: 'New client has been attached' });
  };

  const handleUpdateAppointment = async () => {
    try {
      setIsUpdating(true);
      const payload = {
        clientId:       selectedClient?.id || formData.clientId,
        clientName:     formData.clientName,
        clientPhone:    formData.clientPhone,
        service:        formData.service,
        date:           formData.date,
        startTime:      formData.startTime,
        endTime:        formData.endTime,
        duration:       formData.duration,
        price:          formData.price,
        status:         formData.status,
        paymentStatus:  formData.paymentStatus,
        paymentMethod:  formData.paymentMethod,
        notes:          formData.notes,
        staffId:        formData.staffId
      };
      await appointmentApi.updateAppointment(appointment.id, payload);
      toast({ title: 'Success', description: 'Appointment updated' });

      // optionally refresh calendar/UI
      setTimeout(() => {
        onClose();
        window.location.reload();
      }, 800);
    } catch (err) {
      console.error(err);
      toast({ title: 'Error', description: 'Update failed', variant: 'destructive' });
    } finally {
      setIsUpdating(false);
    }
  };

  const addProduct    = () => setProducts(p => [...p, { id: `${Date.now()}`, name: '', quantity: 1, price: 0 }]);
  const removeProduct = (idx: number) => setProducts(p => p.filter((_, i) => i !== idx));
  const updateProduct = (idx: number, field: string, val: any) => {
    const copy = [...products];
    copy[idx] = { ...copy[idx], [field]: val };
    setProducts(copy);
  };

  const getStatusColor = (s: string) => ({
    Completed:  'bg-green-100 text-green-800 border-green-200',
    Scheduled:  'bg-blue-100  text-blue-800  border-blue-200',
    Cancelled:  'bg-red-100   text-red-800   border-red-200',
    'No Show':  'bg-gray-100  text-gray-800  border-gray-200'
  }[s] || 'bg-gray-100 text-gray-800 border-gray-200');

  const getPayColor = (s: string) => ({
    paid:    'bg-green-100  text-green-800  border-green-200',
    partial: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    unpaid:  'bg-red-100    text-red-800    border-red-200'
  }[s] || 'bg-gray-100 text-gray-800 border-gray-200');

  const total = formData.price + products.reduce((sum, pr) => sum + pr.price * pr.quantity, 0);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600" />
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
              ID: {formData.id} • Created:{' '}
              {new Date(formData.createdAt || '').toLocaleDateString()}
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
          <Badge className={getPayColor(formData.paymentStatus)} variant="outline">
            {formData.paymentStatus}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Client Info */}
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
                onChange={e => setFormData({ ...formData, clientName: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="clientPhone">Phone Number</Label>
              <Input
                id="clientPhone"
                value={formData.clientPhone || ''}
                onChange={e => setFormData({ ...formData, clientPhone: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="service">Service</Label>
              <Select
                value={formData.service}
                onValueChange={val => {
                  const s = services.find(x => x.name === val);
                  setFormData({
                    ...formData,
                    service:  val,
                    price:    s?.price    ?? formData.price,
                    duration: s?.duration ?? formData.duration
                  });
                }}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {services.map(svc => (
                    <SelectItem key={svc.id} value={svc.name}>
                      {svc.name} – ${svc.price}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Schedule & Payment */}
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
                  onChange={e => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={e => setFormData({ ...formData, startTime: e.target.value })}
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
                  onChange={e =>
                    setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>
              <div>
                <Label htmlFor="duration">Duration (min)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration}
                  onChange={e =>
                    setFormData({ ...formData, duration: parseInt(e.target.value) || 60 })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(val: Appointment['status']) =>
                    setFormData({ ...formData, status: val })
                  }
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
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
                  onValueChange={(val: Appointment['paymentStatus']) =>
                    setFormData({ ...formData, paymentStatus: val })
                  }
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
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
                    onValueChange={val =>
                      setFormData({ ...formData, paymentMethod: val })
                    }
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
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
                      value={new Date(formData.paymentDate).toISOString().slice(0, 16)}
                      onChange={e =>
                        setFormData({ ...formData, paymentDate: e.target.value })
                      }
                    />
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Products */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Additional Products
            </CardTitle>
            <Button onClick={addProduct} variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" /> Add Product
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              No additional products added
            </p>
          ) : (
            products.map((prod, i) => (
              <div key={prod.id} className="flex items-center gap-3 p-3 border rounded-lg">
                <Input
                  placeholder="Product name"
                  value={prod.name}
                  onChange={e => updateProduct(i, 'name', e.target.value)}
                  className="flex-1"
                />
                <Input
                  type="number"
                  placeholder="Qty"
                  value={prod.quantity}
                  onChange={e => updateProduct(i, 'quantity', parseInt(e.target.value) || 1)}
                  className="w-20"
                />
                <Input
                  type="number"
                  placeholder="Price"
                  value={prod.price}
                  onChange={e =>
                    updateProduct(i, 'price', parseFloat(e.target.value) || 0)
                  }
                  className="w-24"
                />
                <Button onClick={() => removeProduct(i)} variant="outline" size="sm">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={formData.notes || ''}
            onChange={e => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Add any additional notes..."
            rows={3}
          />
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-lg font-semibold">
              Total Amount: ${total.toFixed(2)}
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
