
import React, { useState } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Appointment } from '@/services/types';
import DragDropCalendar from '@/components/DragDropCalendar';
import { EditAppointmentDialog } from '@/components/EditAppointmentDialog';
import { AddAppointmentDialog } from '@/components/AddAppointmentDialog';
import { QuickPaymentDialog } from '@/components/QuickPaymentDialog';
import { DailyActivityLog } from '@/components/DailyActivityLog';

const Appointments = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const { hasPermissionSync } = usePermissions();

  const canViewAppointments = hasPermissionSync('appointments', 'view');

  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowEditDialog(true);
  };

  const handleCloseEditDialog = () => {
    setShowEditDialog(false);
    setSelectedAppointment(null);
  };

  const goToPreviousDay = () => {
    const previousDay = new Date(selectedDate);
    previousDay.setDate(selectedDate.getDate() - 1);
    setSelectedDate(previousDay);
  };

  const goToNextDay = () => {
    const nextDay = new Date(selectedDate);
    nextDay.setDate(selectedDate.getDate() + 1);
    setSelectedDate(nextDay);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
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
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-blue-50 to-indigo-50 flex flex-col">
      {/* Header */}
      <div className="bg-white/70 backdrop-blur-sm border-b border-violet-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-violet-600 to-blue-600 rounded-lg">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
                Appointments
              </h1>
              <p className="text-gray-600 text-sm">Manage your salon appointments</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={goToPreviousDay} 
            className="bg-white/70 border-violet-200 hover:bg-violet-50"
          >
            Previous
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            onClick={goToToday} 
            className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700"
          >
            Today
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={goToNextDay} 
            className="bg-white/70 border-violet-200 hover:bg-violet-50"
          >
            Next
          </Button>
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

      {/* Date Display */}
      <div className="px-6 py-4">
        <Card className="bg-white/70 backdrop-blur-sm border-violet-200 shadow-sm">
          <CardContent className="px-6 py-4">
            <h2 className="text-xl font-semibold bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
              {format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </h2>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-6 pb-6 space-y-6">
        {/* Calendar */}
        <Card className="bg-white/70 backdrop-blur-sm border-violet-200 shadow-lg">
          <CardContent className="p-6">
            <DragDropCalendar onAppointmentClick={handleAppointmentClick} />
          </CardContent>
        </Card>

        {/* Daily Activity Log */}
        <DailyActivityLog selectedDate={selectedDate} />
      </div>

      {/* Direct Edit Appointment Dialog */}
      <EditAppointmentDialog
        appointment={selectedAppointment}
        isOpen={showEditDialog}
        onClose={handleCloseEditDialog}
      />
    </div>
  );
};

export default Appointments;
