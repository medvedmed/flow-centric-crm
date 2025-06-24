
import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { format } from 'date-fns';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { MultiServiceSelector } from './MultiServiceSelector';
import { AppointmentClientSection } from './forms/AppointmentClientSection';
import { AppointmentDateTimeSection } from './forms/AppointmentDateTimeSection';
import { useStaff } from '@/hooks/staff/useStaffHooks';
import { useToast } from '@/hooks/use-toast';
import { timeUtils } from '@/utils/timeUtils';
import { enhancedAppointmentApi, CreateAppointmentService } from '@/services/api/enhancedAppointmentApi';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface SelectedService {
  id: string;
  name: string;
  price: number;
  duration: number;
  category: string;
  staffId?: string;
}

interface EnhancedAppointmentFormProps {
  selectedDate?: Date;
  selectedTime?: string;
  selectedStaffId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const EnhancedAppointmentForm: React.FC<EnhancedAppointmentFormProps> = ({
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
    date: selectedDate || new Date(),
    startTime: selectedTime || '09:00',
    notes: ''
  });

  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);
  const [isClientDataLoading, setIsClientDataLoading] = useState(false);

  const { data: staff = [] } = useStaff();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createAppointmentMutation = useMutation({
    mutationFn: async (data: any) => {
      const services: CreateAppointmentService[] = selectedServices.map(service => ({
        service_name: service.name,
        service_price: service.price,
        service_duration: service.duration,
        staff_id: service.staffId
      }));

      return enhancedAppointmentApi.createMultiServiceAppointment(data, services);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast({
        title: "Success",
        description: "Multi-service appointment created successfully!",
      });
      onSuccess?.();
    },
    onError: (error) => {
      console.error('Error creating appointment:', error);
      toast({
        title: "Error",
        description: "Failed to create appointment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleClientSelect = (clientId: string, clientName: string, clientPhone?: string) => {
    setIsClientDataLoading(true);
    
    setFormData(prev => ({
      ...prev,
      clientId,
      clientName,
      clientPhone: clientPhone || ''
    }));
    
    setTimeout(() => {
      setIsClientDataLoading(false);
    }, 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedServices.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select at least one service",
        variant: "destructive"
      });
      return;
    }

    if (!formData.clientName.trim()) {
      toast({
        title: "Validation Error",
        description: "Client name is required",
        variant: "destructive"
      });
      return;
    }

    const totalDuration = selectedServices.reduce((sum, service) => sum + service.duration, 0);
    const endTime = timeUtils.calculateEndTime(formData.startTime, totalDuration);

    const appointmentData = {
      client_id: formData.clientId || null,
      client_name: formData.clientName,
      client_phone: formData.clientPhone,
      staff_id: formData.staffId || selectedServices[0]?.staffId || null,
      service: selectedServices.map(s => s.name).join(', '),
      date: format(formData.date, 'yyyy-MM-dd'),
      start_time: formData.startTime,
      end_time: endTime,
      duration: totalDuration,
      price: selectedServices.reduce((sum, service) => sum + service.price, 0),
      status: 'Scheduled',
      notes: formData.notes,
      salon_id: null // Will be set by the API
    };

    createAppointmentMutation.mutate(appointmentData);
  };

  const totalPrice = selectedServices.reduce((sum, service) => sum + service.price, 0);
  const totalDuration = selectedServices.reduce((sum, service) => sum + service.duration, 0);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {isClientDataLoading && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Loading client information...
          </AlertDescription>
        </Alert>
      )}

      <AppointmentClientSection
        clientId={formData.clientId}
        clientName={formData.clientName}
        clientPhone={formData.clientPhone}
        onClientSelect={handleClientSelect}
        onClientNameChange={(name) => {
          setFormData(prev => ({ ...prev, clientName: name }));
        }}
        onClientPhoneChange={(phone) => {
          setFormData(prev => ({ ...prev, clientPhone: phone }));
        }}
      />

      {/* Multi-Service Selection */}
      <div className="space-y-2">
        <Label>Services *</Label>
        <MultiServiceSelector
          selectedServices={selectedServices}
          onServicesChange={setSelectedServices}
          availableStaff={staff}
        />
        {selectedServices.length > 0 && (
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Total Duration: {totalDuration} minutes</span>
            <span>Total Price: ${totalPrice}</span>
          </div>
        )}
      </div>

      {/* Primary Staff Selection */}
      <div className="space-y-2">
        <Label>Primary Staff Member</Label>
        <Select value={formData.staffId} onValueChange={(value) => {
          setFormData(prev => ({ ...prev, staffId: value }));
        }}>
          <SelectTrigger>
            <SelectValue placeholder="Select primary staff member" />
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
        onDateChange={(date) => {
          setFormData(prev => ({ ...prev, date }));
        }}
        onTimeChange={(time) => {
          setFormData(prev => ({ ...prev, startTime: time }));
        }}
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
          disabled={createAppointmentMutation.isPending || selectedServices.length === 0 || isClientDataLoading}
          className="flex-1"
        >
          {createAppointmentMutation.isPending ? "Creating..." : "Book Multi-Service Appointment"}
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
