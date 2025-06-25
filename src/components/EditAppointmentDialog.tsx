
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { appointmentApi } from '@/services/api/appointmentApi';
import { serviceApi } from '@/services/api/serviceApi';
import { staffApi } from '@/services/api/staffApi';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Appointment } from '@/services/types';
import { ClientInfoSection } from './appointment/ClientInfoSection';
import { SchedulingSection } from './appointment/SchedulingSection';
import { PaymentSection } from './appointment/PaymentSection';
import { NotesSection } from './appointment/NotesSection';

interface EditAppointmentDialogProps {
  appointment: Appointment | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EditAppointmentDialog: React.FC<EditAppointmentDialogProps> = ({
  appointment,
  isOpen,
  onClose
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Form state
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [status, setStatus] = useState<Appointment['status']>('Scheduled');
  const [appointmentColor, setAppointmentColor] = useState('#3b82f6');
  const [paymentStatus, setPaymentStatus] = useState<'paid' | 'unpaid' | 'partial'>('unpaid');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [notes, setNotes] = useState('');

  // Populate form when appointment changes
  useEffect(() => {
    if (appointment) {
      console.log('Populating form with appointment data:', appointment);
      setClientName(appointment.clientName || '');
      setClientPhone(appointment.clientPhone || '');
      setAppointmentDate(appointment.date || '');
      setStartTime(appointment.startTime || '');
      setEndTime(appointment.endTime || '');
      setStatus(appointment.status || 'Scheduled');
      setAppointmentColor(appointment.color || '#3b82f6');
      setPaymentStatus(appointment.paymentStatus || 'unpaid');
      setPaymentMethod(appointment.paymentMethod || 'cash');
      setNotes(appointment.notes || '');
    }
  }, [appointment]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setClientName('');
      setClientPhone('');
      setAppointmentDate('');
      setStartTime('');
      setEndTime('');
      setStatus('Scheduled');
      setAppointmentColor('#3b82f6');
      setPaymentStatus('unpaid');
      setPaymentMethod('cash');
      setNotes('');
    }
  }, [isOpen]);

  const handleSave = async () => {
    if (!appointment) return;

    try {
      const updateData = {
        clientName: clientName,
        clientPhone: clientPhone,
        date: appointmentDate,
        startTime: startTime,
        endTime: endTime,
        status,
        color: appointmentColor,
        paymentStatus: paymentStatus,
        paymentMethod: paymentMethod,
        notes
      };

      console.log('Updating appointment with data:', updateData);
      await appointmentApi.updateAppointment(appointment.id, updateData);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['appointments', appointmentDate] });
      
      toast({
        title: "Success",
        description: "Appointment updated successfully"
      });
      
      onClose();
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast({
        title: "Error",
        description: "Failed to update appointment",
        variant: "destructive"
      });
    }
  };

  if (!appointment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Appointment</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <ClientInfoSection
            clientName={clientName}
            clientPhone={clientPhone}
            onClientNameChange={setClientName}
            onClientPhoneChange={setClientPhone}
          />

          <SchedulingSection
            appointmentDate={appointmentDate}
            startTime={startTime}
            endTime={endTime}
            status={status}
            appointmentColor={appointmentColor}
            onDateChange={setAppointmentDate}
            onStartTimeChange={setStartTime}
            onEndTimeChange={setEndTime}
            onStatusChange={setStatus}
            onColorChange={setAppointmentColor}
          />

          <PaymentSection
            paymentStatus={paymentStatus}
            paymentMethod={paymentMethod}
            onPaymentStatusChange={setPaymentStatus}
            onPaymentMethodChange={setPaymentMethod}
          />

          <NotesSection
            notes={notes}
            onNotesChange={setNotes}
          />

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
