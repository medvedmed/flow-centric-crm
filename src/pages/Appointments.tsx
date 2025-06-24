
import React, { useState } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Calendar } from 'lucide-react';
import { AppointmentScheduler } from '@/components/AppointmentScheduler';
import { EditAppointmentDialog } from '@/components/EditAppointmentDialog';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Appointment } from '@/services/types';

const Appointments = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const { hasPermissionSync } = usePermissions();

  const canViewAppointments = hasPermissionSync('appointments', 'view');

  const handleAppointmentClick = (appointment: Appointment) => {
    setEditingAppointment(appointment);
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
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <Shield className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-gray-600">You don't have permission to view appointments.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen w-full overflow-hidden bg-white flex flex-col">
      {/* Date Navigation Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-600" />
            <h1 className="text-lg font-semibold text-gray-900">
              {format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </h1>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToPreviousDay}>
            Previous
          </Button>
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
          <Button variant="outline" size="sm" onClick={goToNextDay}>
            Next
          </Button>
        </div>
      </div>

      {/* Main Scheduler */}
      <div className="flex-1 overflow-hidden">
        <AppointmentScheduler
          selectedDate={selectedDate}
          onAppointmentClick={handleAppointmentClick}
        />
      </div>

      {/* Edit Appointment Dialog */}
      <EditAppointmentDialog
        appointment={editingAppointment}
        isOpen={!!editingAppointment}
        onClose={() => setEditingAppointment(null)}
      />
    </div>
  );
};

export default Appointments;
