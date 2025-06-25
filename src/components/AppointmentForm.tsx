import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { format } from 'date-fns';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { ServiceSelector } from './ServiceSelector';
import { AppointmentClientSection } from './forms/AppointmentClientSection';
import { AppointmentDateTimeSection } from './forms/AppointmentDateTimeSection';
import { useStaff } from '@/hooks/staff/useStaffHooks';
import { useCreateAppointment } from '@/hooks/appointments/useAppointmentHooks';
import { useToast } from '@/hooks/use-toast';
import { timeUtils } from '@/utils/timeUtils';
import { AppointmentValidator, ValidationResult } from '@/services/validation/appointmentValidation';
import { ErrorHandler } from '@/services/errorHandling/errorService';

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
    notes: '',
    color: '#007bff'
  });

  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [isClientDataLoading, setIsClientDataLoading] = useState(false);

  const { data: staff = [] } = useStaff();
  const createAppointment = useCreateAppointment();
  const { toast } = useToast();

  const debouncedValidation = useCallback(
    (data = formData) => {
      if (isClientDataLoading) return;

      const timeoutId = setTimeout(() => {
        const result = AppointmentValidator.validateAppointment({
          clientId: data.clientId,
          clientName: data.clientName,
          clientPhone: data.clientPhone,
          staffId: data.staffId,
          service: data.service,
          date: data.date,
          startTime: data.startTime,
          duration: data.duration,
          price: data.price
        });

        setValidation(result);
      }, 300);

      return () => clearTimeout(timeoutId);
    },
    [formData, isClientDataLoading]
  );

  useEffect(() => {
    const cleanup = debouncedValidation();
    return cleanup;
  }, [debouncedValidation]);

  const handleClientSelect = (clientId: string, clientName: string, clientPhone?: string) => {
    setIsClientDataLoading(true);

    setFormData(prev => ({
      ...prev,
      clientId,
      clientName,
      clientPhone: clientPhone || ''
    }));

    setTimeout(() => setIsClientDataLoading(false), 100);
  };

  const handleServiceSelect = (service: string, price: number, duration: number) => {
    setFormData(prev => ({ ...prev, service, price, duration }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationResult = AppointmentValidator.validateAppointment({
      clientId: formData.clientId,
      clientName: formData.clientName,
      clientPhone: formData.clientPhone,
      staffId: formData.staffId,
      service: formData.service,
      date: formData.date,
      startTime: formData.startTime,
      duration: formData.duration,
      price: formData.price
    });

    if (!validationResult.isValid) {
      setValidation(validationResult);
      toast({
        title: "Validation Error",
        description: "Please fix the errors before submitting",
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
      notes: formData.notes,
      color: formData.color
    };

    try {
      await createAppointment.mutateAsync(appointmentData);
      toast({
        title: "Appointment Booked",
        description: `Appointment for ${formData.clientName} has been scheduled.`,
      });
      onSuccess?.();
    } catch (error) {
      const appError = ErrorHandler.handleApiError(error);
      ErrorHandler.logError(appError, 'AppointmentForm.handleSubmit');

      toast({
        title: "Booking Failed",
        description: ErrorHandler.getErrorMessage(appError),
        variant: "destructive"
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {isClientDataLoading && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>Loading client information...</AlertDescription>
        </Alert>
      )}

      {!isClientDataLoading && validation && !validation.isValid && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              {validation.errors.map((error, index) => (
                <div key={index}>• {error.message}</div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {!isClientDataLoading && validation && validation.warnings.length > 0 && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              {validation.warnings.map((warning, index) => (
                <div key={index}>• {warning}</div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      <AppointmentClientSection
        clientId={formData.clientId}
        clientName={formData.clientName}
        clientPhone={formData.clientPhone}
        onClientSelect={handleClientSelect}
        onClientNameChange={(name) => setFormData(prev => ({ ...prev, clientName: name }))}
        onClientPhoneChange={(phone) => setFormData(prev => ({ ...prev, clientPhone: phone }))}
      />

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

      <div className="space-y-2">
        <Label>Staff Member *</Label>
        <Select value={formData.staffId} onValueChange={(value) => setFormData(prev => ({ ...prev, staffId: value }))}>
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

      <div className="space-y-2">
        <Label htmlFor="color">Appointment Color</Label>
        <Input
          type="color"
          id="color"
          value={formData.color}
          onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
        />
      </div>

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

      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          disabled={createAppointment.isPending || (validation && !validation.isValid) || isClientDataLoading}
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