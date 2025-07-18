
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { appointmentApi } from '@/services/api/appointmentApi';
import { staffApi } from '@/services/api/staffApi';
import { serviceApi } from '@/services/api/serviceApi';
import { Appointment, Staff, Service } from '@/services/types';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Save, Download, Calendar, Clock, User, Phone, Mail, DollarSign, Receipt } from 'lucide-react';

interface EditAppointmentFormProps {
  appointment: Appointment;
  onClose: () => void;
}

export const EditAppointmentForm: React.FC<EditAppointmentFormProps> = ({
  appointment: initialAppointment,
  onClose
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [appointment, setAppointment] = useState<Appointment>(initialAppointment);

  // Fetch fresh appointment data
  const { data: allAppointments, refetch: refetchAppointment } = useQuery({
    queryKey: ['appointments'],
    queryFn: () => appointmentApi.getAppointments(),
  });
  
  const freshAppointment = React.useMemo(() => {
    if (!allAppointments) return initialAppointment;
    if (Array.isArray(allAppointments)) {
      return allAppointments.find(apt => apt.id === appointment.id) || initialAppointment;
    }
    if (allAppointments && typeof allAppointments === 'object' && 'data' in allAppointments) {
      return (allAppointments as any).data?.find((apt: Appointment) => apt.id === appointment.id) || initialAppointment;
    }
    return initialAppointment;
  }, [allAppointments, appointment.id, initialAppointment]);

  // Update local state when fresh data arrives
  useEffect(() => {
    if (freshAppointment) {
      setAppointment(freshAppointment);
    }
  }, [freshAppointment]);

  const { data: staff = [] } = useQuery({
    queryKey: ['staff'],
    queryFn: () => staffApi.getStaff()
  });

  const { data: services = [] } = useQuery({
    queryKey: ['services'],
    queryFn: () => serviceApi.getServices()
  });

  const handleInputChange = (field: keyof Appointment, value: any) => {
    setAppointment(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      console.log('Saving appointment:', appointment);
      
      await appointmentApi.updateAppointment(appointment.id, {
        clientName: appointment.clientName,
        clientPhone: appointment.clientPhone,
        service: appointment.service,
        staffId: appointment.staffId,
        date: appointment.date,
        startTime: appointment.startTime,
        endTime: appointment.endTime,
        duration: appointment.duration,
        price: appointment.price,
        status: appointment.status,
        paymentStatus: appointment.paymentStatus,
        paymentMethod: appointment.paymentMethod,
        
        notes: appointment.notes
      });

      // Invalidate and refetch all related queries
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['appointments'] }),
        queryClient.invalidateQueries({ queryKey: ['appointment', appointment.id] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard-data'] }),
        refetchAppointment()
      ]);

      toast({
        title: "Success!",
        description: "Appointment updated successfully!",
      });

    } catch (error) {
      console.error('Error updating appointment:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update appointment",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateReceipt = () => {
    const receiptContent = `
APPOINTMENT RECEIPT
==================

Client: ${appointment.clientName}
Phone: ${appointment.clientPhone || 'N/A'}
Service: ${appointment.service}
Staff: ${staff.find(s => s.id === appointment.staffId)?.name || 'N/A'}
Date: ${appointment.date}
Time: ${appointment.startTime} - ${appointment.endTime}
Duration: ${appointment.duration} minutes

Price: $${appointment.price}
Payment Status: ${appointment.paymentStatus}
${appointment.paymentMethod ? `Payment Method: ${appointment.paymentMethod}` : ''}


${appointment.notes ? `Notes: ${appointment.notes}` : ''}

Generated on: ${new Date().toLocaleString()}
    `.trim();

    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${appointment.clientName}-${appointment.date}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Receipt Downloaded",
      description: "Receipt has been downloaded successfully",
    });
  };

  return (
    <div className="space-y-6 max-h-[80vh] overflow-y-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-blue-600 text-white p-4 rounded-lg">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Edit Appointment
        </h2>
        <p className="text-violet-100 mt-1">Update appointment details and payment information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Client Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Client Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="clientName">Client Name</Label>
              <Input
                id="clientName"
                value={appointment.clientName}
                onChange={(e) => handleInputChange('clientName', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="clientPhone">Phone Number</Label>
              <Input
                id="clientPhone"
                value={appointment.clientPhone || ''}
                onChange={(e) => handleInputChange('clientPhone', e.target.value)}
                placeholder="Enter phone number"
              />
            </div>
          </CardContent>
        </Card>

        {/* Service Details */}
        <Card>
          <CardHeader>
            <CardTitle>Service Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="service">Service</Label>
              <Select 
                value={appointment.service} 
                onValueChange={(value) => {
                  const servicesArray = Array.isArray(services) ? services : services?.data || [];
                  const selectedService = servicesArray.find(s => s.name === value);
                  handleInputChange('service', value);
                  if (selectedService) {
                    handleInputChange('price', selectedService.price);
                    handleInputChange('duration', selectedService.duration);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select service" />
                </SelectTrigger>
                <SelectContent>
                  {(Array.isArray(services) ? services : services?.data || []).map((service) => (
                    <SelectItem key={service.id} value={service.name}>
                      {service.name} - ${service.price} ({service.duration}min)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="staff">Staff Member</Label>
              <Select 
                value={appointment.staffId || ''} 
                onValueChange={(value) => handleInputChange('staffId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select staff member" />
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
          </CardContent>
        </Card>

        {/* Date & Time */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Date & Time
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={appointment.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={appointment.startTime}
                  onChange={(e) => handleInputChange('startTime', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={appointment.endTime}
                  onChange={(e) => handleInputChange('endTime', e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                value={appointment.duration}
                onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Payment Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Payment Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={appointment.price}
                onChange={(e) => handleInputChange('price', parseFloat(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="paymentStatus">Payment Status</Label>
              <Select 
                value={appointment.paymentStatus || 'unpaid'} 
                onValueChange={(value) => handleInputChange('paymentStatus', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unpaid">Unpaid</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {appointment.paymentStatus === 'paid' && (
              <>
                <div>
                  <Label htmlFor="paymentMethod">Payment Method</Label>
                  <Select 
                    value={appointment.paymentMethod || ''} 
                    onValueChange={(value) => handleInputChange('paymentMethod', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                      <SelectItem value="transfer">Bank Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="price">Total Amount ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={appointment.price}
                    onChange={(e) => handleInputChange('price', parseFloat(e.target.value))}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Status & Notes */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Status & Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="status">Appointment Status</Label>
              <Select 
                value={appointment.status} 
                onValueChange={(value) => handleInputChange('status', value)}
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
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={appointment.notes || ''}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Add any additional notes..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Display */}
      <div className="flex gap-2 flex-wrap">
        <Badge variant={appointment.status === 'Completed' ? 'default' : 'secondary'}>
          {appointment.status}
        </Badge>
        <Badge variant={appointment.paymentStatus === 'paid' ? 'default' : 'destructive'}>
          {appointment.paymentStatus || 'unpaid'}
        </Badge>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button 
          onClick={handleSave} 
          disabled={loading}
          className="flex-1"
        >
          <Save className="w-4 h-4 mr-2" />
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
        <Button 
          onClick={generateReceipt}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Receipt className="w-4 h-4" />
          Download Receipt
        </Button>
        <Button 
          onClick={onClose}
          variant="outline"
        >
          Close
        </Button>
      </div>
    </div>
  );
};
