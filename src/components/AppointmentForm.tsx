
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { ServiceSelector } from './ServiceSelector';
import { AppointmentClientSection } from './forms/AppointmentClientSection';
import { AppointmentDateTimeSection } from './forms/AppointmentDateTimeSection';
import { useStaff } from '@/hooks/staff/useStaffHooks';
import { useCreateAppointment } from '@/hooks/appointments/useAppointmentHooks';
import { useToast } from '@/hooks/use-toast';
import { timeUtils } from '@/utils/timeUtils';

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

    const endTime = timeUtils.calculateEndTime(formData.startTime, formData.duration);

    const appointmentData = {
      clientId: formData.clientId || undefined,
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
      <AppointmentClientSection
        clientId={formData.clientId}
        clientName={formData.clientName}
        clientPhone={formData.clientPhone}
        onClientSelect={handleClientSelect}
        onClientNameChange={(name) => setFormData(prev => ({ ...prev, clientName: name }))}
        onClientPhoneChange={(phone) => setFormData(prev => ({ ...prev, clientPhone: phone }))}
      />

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

      <AppointmentDateTimeSection
        date={formData.date}
        startTime={formData.startTime}
        onDateChange={(date) => setFormData(prev => ({ ...prev, date }))}
        onTimeChange={(time) => setFormData(prev => ({ ...prev, startTime: time }))}
      />

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
