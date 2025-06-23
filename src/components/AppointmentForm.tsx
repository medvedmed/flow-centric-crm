
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { CalendarIcon, Clock, User, Phone, Mail } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ClientSelector } from './ClientSelector';
import { ServiceSelector } from './ServiceSelector';
import { useStaff, useCreateAppointment } from '@/hooks/useCrmData';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface AppointmentFormProps {
  selectedDate?: Date;
  selectedTime?: string;
  selectedStaffId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const AppointmentForm: React.FC<AppointmentFormProps> = ({
  selectedDate,
  selectedTime,
  selectedStaffId,
  onSuccess,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    clientId: '',
    clientName: '',
    clientPhone: '',
    staffId: selectedStaffId || '',
    service: '',
    date: selectedDate || new Date(),
    startTime: selectedTime || '09:00',
    duration: 60,
    price: 0,
    notes: ''
  });

  const { data: staff = [] } = useStaff();
  const createAppointment = useCreateAppointment();
  const { toast } = useToast();

  // Generate time slots
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour <= 20; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        if (hour === 20 && minute > 0) break;
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(time);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const handleClientSelect = (clientId: string, clientName: string, clientPhone?: string) => {
    setFormData(prev => ({
      ...prev,
      clientId,
      clientName,
      clientPhone: clientPhone || ''
    }));
  };

  const handleServiceSelect = (service: string, price: number, duration: number) => {
    setFormData(prev => ({
      ...prev,
      service,
      price,
      duration
    }));
  };

  const calculateEndTime = (startTime: string, duration: number) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const startDate = new Date();
    startDate.setHours(hours, minutes, 0, 0);
    
    const endDate = new Date(startDate.getTime() + duration * 60000);
    return format(endDate, 'HH:mm');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.clientName || !formData.service || !formData.staffId) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const endTime = calculateEndTime(formData.startTime, formData.duration);

    const appointmentData = {
      clientId: formData.clientId || null,
      clientName: formData.clientName,
      clientPhone: formData.clientPhone,
      staffId: formData.staffId,
      service: formData.service,
      date: format(formData.date, 'yyyy-MM-dd'),
      startTime: formData.startTime,
      endTime,
      duration: formData.duration,
      price: formData.price,
      status: 'Scheduled' as const,
      notes: formData.notes
    };

    try {
      await createAppointment.mutateAsync(appointmentData);
      toast({
        title: "Appointment Booked",
        description: `Appointment for ${formData.clientName} has been scheduled.`,
      });
      onSuccess?.();
    } catch (error) {
      toast({
        title: "Booking Failed",
        description: "Failed to create appointment. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Client Selection */}
      <div className="space-y-2">
        <Label>Client *</Label>
        <ClientSelector
          value={formData.clientId}
          onValueChange={handleClientSelect}
        />
        {!formData.clientId && formData.clientName && (
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <User className="inline w-4 h-4 mr-1" />
              Walk-in client: <strong>{formData.clientName}</strong>
            </p>
            {formData.clientPhone && (
              <p className="text-sm text-blue-700 mt-1">
                <Phone className="inline w-4 h-4 mr-1" />
                {formData.clientPhone}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Manual Client Info for Walk-ins */}
      {!formData.clientId && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <Label htmlFor="walkInName">Walk-in Client Name *</Label>
            <Input
              id="walkInName"
              value={formData.clientName}
              onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
              placeholder="Enter client name"
            />
          </div>
          <div>
            <Label htmlFor="walkInPhone">Phone Number</Label>
            <Input
              id="walkInPhone"
              value={formData.clientPhone}
              onChange={(e) => setFormData(prev => ({ ...prev, clientPhone: e.target.value }))}
              placeholder="Enter phone number"
            />
          </div>
        </div>
      )}

      {/* Service Selection */}
      <div className="space-y-2">
        <Label>Service *</Label>
        <ServiceSelector
          value={formData.service}
          onValueChange={handleServiceSelect}
        />
        {formData.service && (
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Duration: {formData.duration} minutes</span>
            <span>Price: ${formData.price}</span>
          </div>
        )}
      </div>

      {/* Staff Selection */}
      <div className="space-y-2">
        <Label>Staff Member *</Label>
        <Select value={formData.staffId} onValueChange={(value) => 
          setFormData(prev => ({ ...prev, staffId: value }))
        }>
          <SelectTrigger>
            <SelectValue placeholder="Select staff member" />
          </SelectTrigger>
          <SelectContent>
            {staff.length === 0 ? (
              <SelectItem value="no-staff" disabled>No staff available</SelectItem>
            ) : (
              staff.map((member) => (
                <SelectItem key={member.id} value={member.id}>
                  <div className="flex items-center gap-2">
                    <span>{member.name}</span>
                    {member.specialties && member.specialties.length > 0 && (
                      <span className="text-xs text-muted-foreground">
                        ({member.specialties.join(', ')})
                      </span>
                    )}
                  </div>
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Date and Time Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Date *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !formData.date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.date ? format(formData.date, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={formData.date}
                onSelect={(date) => date && setFormData(prev => ({ ...prev, date }))}
                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label>Time *</Label>
          <Select value={formData.startTime} onValueChange={(value) =>
            setFormData(prev => ({ ...prev, startTime: value }))
          }>
            <SelectTrigger>
              <SelectValue placeholder="Select time" />
            </SelectTrigger>
            <SelectContent>
              {timeSlots.map((time) => (
                <SelectItem key={time} value={time}>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {time}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          placeholder="Any special instructions or notes..."
          rows={3}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          disabled={createAppointment.isPending || !formData.clientName || !formData.service || !formData.staffId}
          className="flex-1"
        >
          {createAppointment.isPending ? "Booking..." : "Book Appointment"}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
};
