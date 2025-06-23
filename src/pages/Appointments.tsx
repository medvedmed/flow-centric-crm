
import React, { useState } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { ProtectedComponent } from '@/components/ProtectedComponent';
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
    <div className="space-y-6 h-full max-w-none">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Appointments
        </h1>
        <p className="text-muted-foreground mt-1">Manage your salon appointments with drag-and-drop scheduling.</p>
      </div>

      {/* Full Width Layout: 75% Scheduler + 25% Calendar */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 h-full min-h-[700px]">
        {/* Appointment Scheduler - 75% width on large screens */}
        <div className="xl:col-span-3">
          <ProtectedComponent area="appointments" action="view">
            <AppointmentScheduler
              selectedDate={selectedDate}
              onAppointmentMove={handleAppointmentMove}
            />
          </ProtectedComponent>
        </div>

        {/* Mini Calendar - 25% width on large screens */}
        <div className="xl:col-span-1">
          <MiniCalendar
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
          />
        </div>
      </div>
    </div>
  );
};

export default Appointments;
