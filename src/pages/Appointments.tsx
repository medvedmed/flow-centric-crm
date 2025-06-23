
import React, { useState } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { Card, CardContent } from '@/components/ui/card';
import { Shield } from 'lucide-react';
import { AppointmentScheduler } from '@/components/AppointmentScheduler';
import { MiniCalendar } from '@/components/MiniCalendar';

const Appointments = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { hasPermissionSync } = usePermissions();

  const canViewAppointments = hasPermissionSync('appointments', 'view');

  const handleAppointmentMove = (appointmentId: string, newStaffId: string, newTime: string) => {
    console.log('Moving appointment:', { appointmentId, newStaffId, newTime });
    // TODO: Implement actual appointment moving logic with API call
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
    <div className="h-screen flex flex-col bg-white overflow-hidden">
      {/* Compact Header with Calendar */}
      <div className="flex-shrink-0 p-3 border-b border-gray-300 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Appointments</h1>
            <p className="text-xs text-gray-600">Drag-and-drop scheduling</p>
          </div>
          <div className="w-72">
            <MiniCalendar
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
            />
          </div>
        </div>
      </div>

      {/* Full Height Scheduler */}
      <div className="flex-1 overflow-hidden">
        <AppointmentScheduler
          selectedDate={selectedDate}
          onAppointmentMove={handleAppointmentMove}
        />
      </div>
    </div>
  );
};

export default Appointments;
