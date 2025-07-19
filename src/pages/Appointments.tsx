
import React, { useState } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Calendar, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Appointment } from '@/services/types';
import { DragDropCalendar } from '@/components/scheduler/DragDropCalendar';
import { EditAppointmentDialog } from '@/components/EditAppointmentDialog';
import { AddAppointmentDialog } from '@/components/AddAppointmentDialog';
import { QuickPaymentDialog } from '@/components/QuickPaymentDialog';
import { DailyActivityLog } from '@/components/DailyActivityLog';
import { WorkingHoursManager } from '@/components/WorkingHoursManager';

import { useAppointmentData } from '@/hooks/useAppointmentData';
import { useAppointmentOperations } from '@/hooks/useAppointmentOperations';

const Appointments = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [timeSlotData, setTimeSlotData] = useState<any>(null);
  
  const { staff, appointments } = useAppointmentData(format(selectedDate, 'yyyy-MM-dd'));
  const { moveAppointment } = useAppointmentOperations();
  
  const {
    hasPermissionSync
  } = usePermissions();
  const canViewAppointments = hasPermissionSync('appointments', 'view');

  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowEditDialog(true);
  };

  const handleCloseEditDialog = () => {
    setShowEditDialog(false);
    setSelectedAppointment(null);
  };

  const handleTimeSlotClick = (slotData: any) => {
    setTimeSlotData(slotData);
    setShowAddDialog(true);
  };

  const handleCloseAddDialog = () => {
    setShowAddDialog(false);
    setTimeSlotData(null);
  };

  const handleAppointmentMove = async (appointmentId: string, newStaffId: string, newTime: string) => {
    await moveAppointment({ 
      appointmentId, 
      newStaffId, 
      newTime,
      duration: 60 
    });
  };

  if (!canViewAppointments) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-violet-50 to-blue-50">
        <Card className="max-w-md shadow-xl rounded-2xl bg-white/70 backdrop-blur-sm border-violet-200">
          <CardContent className="p-8 text-center">
            <Shield className="h-16 w-16 mx-auto mb-6 text-violet-400" />
            <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
              Access Denied
            </h2>
            <p className="text-gray-600">You don't have permission to view appointments.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Appointments
              </h1>
              <p className="text-gray-600 text-sm">Manage your salon appointments</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <WorkingHoursManager 
            trigger={
              <Button variant="outline" className="gap-2">
                <Settings className="w-4 h-4" />
                Working Hours
              </Button>
            } 
          />
          <AddAppointmentDialog 
            selectedDate={selectedDate} 
            trigger={
              <Button className="gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700">
                + Add Appointment
              </Button>
            } 
          />
          <QuickPaymentDialog />
        </div>
      </div>

      {/* Drag Drop Calendar */}
      <div className="flex-1">
        <DragDropCalendar
          staff={staff}
          appointments={appointments}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          onAppointmentClick={handleAppointmentClick}
          onTimeSlotClick={handleTimeSlotClick}
          onAppointmentMove={handleAppointmentMove}
        />
      </div>

      {/* Dialogs */}
      <EditAppointmentDialog 
        appointment={selectedAppointment} 
        isOpen={showEditDialog} 
        onClose={handleCloseEditDialog} 
      />

      <AddAppointmentDialog 
        isOpen={showAddDialog} 
        onClose={handleCloseAddDialog} 
        selectedDate={timeSlotData?.date} 
        selectedTime={timeSlotData?.time} 
        selectedStaffId={timeSlotData?.staffId} 
      />
    </div>
  );
};

export default Appointments;
