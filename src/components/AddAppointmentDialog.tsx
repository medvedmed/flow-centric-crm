
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { EnhancedAppointmentForm } from './EnhancedAppointmentForm';
import { format } from 'date-fns';

interface AddAppointmentDialogProps {
  selectedDate?: Date;
  selectedTime?: string;
  selectedStaffId?: string;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const AddAppointmentDialog: React.FC<AddAppointmentDialogProps> = ({
  selectedDate = new Date(),
  selectedTime,
  selectedStaffId,
  trigger,
  open,
  onOpenChange
}) => {
  const [internalOpen, setInternalOpen] = useState(false);

  const isControlled = open !== undefined && onOpenChange !== undefined;
  const dialogOpen = isControlled ? open : internalOpen;
  const setDialogOpen = isControlled ? onOpenChange : setInternalOpen;

  const defaultTrigger = (
    <Button size="sm" className="h-8">
      <Plus className="w-4 h-4 mr-1" />
      Add Appointment
    </Button>
  );

  const handleSuccess = () => {
    setDialogOpen(false);
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      {!isControlled && (
        <DialogTrigger asChild>
          {trigger || defaultTrigger}
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Add New Appointment
            {selectedDate && (
              <span className="text-sm font-normal text-gray-600 block">
                {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                {selectedTime && ` at ${selectedTime}`}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>
        <EnhancedAppointmentForm
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          selectedStaffId={selectedStaffId}
          onSuccess={handleSuccess}
        />
      </DialogContent>
    </Dialog>
  );
};
