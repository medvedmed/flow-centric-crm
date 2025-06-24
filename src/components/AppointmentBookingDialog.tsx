
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AppointmentForm } from './AppointmentForm';
import { EnhancedAppointmentForm } from './EnhancedAppointmentForm';

interface AppointmentBookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate?: Date;
  selectedTime?: string;
  selectedStaffId?: string;
}

export const AppointmentBookingDialog: React.FC<AppointmentBookingDialogProps> = ({
  open,
  onOpenChange,
  selectedDate,
  selectedTime,
  selectedStaffId
}) => {
  const handleSuccess = () => {
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Book Appointment</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="single" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="single">Single Service</TabsTrigger>
            <TabsTrigger value="multi">Multiple Services</TabsTrigger>
          </TabsList>
          
          <TabsContent value="single" className="mt-6">
            <AppointmentForm
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              selectedStaffId={selectedStaffId}
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
          </TabsContent>
          
          <TabsContent value="multi" className="mt-6">
            <EnhancedAppointmentForm
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              selectedStaffId={selectedStaffId}
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
