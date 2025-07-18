import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar } from 'lucide-react';
import { Appointment } from '@/services/types';
import { EditAppointmentForm } from './appointments/EditAppointmentForm';
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
  if (!appointment) return null;
  return <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          
        </DialogHeader>

        <EditAppointmentForm appointment={appointment} onClose={onClose} />
      </DialogContent>
    </Dialog>;
};