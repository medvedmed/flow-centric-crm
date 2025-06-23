
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
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Compact Header */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Appointments
            </h1>
            <p className="text-sm text-muted-foreground">Manage your salon appointments with drag-and-drop scheduling.</p>
          </div>
          <div className="w-80">
            <MiniCalendar
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
            />
          </div>
        </div>
      </div>

      {/* Full Height Scheduler */}
      <div className="flex-1 overflow-hidden">
        <ProtectedComponent area="appointments" action="view">
          <AppointmentScheduler
            selectedDate={selectedDate}
            onAppointmentMove={handleAppointmentMove}
          />
        </ProtectedComponent>
      </div>
    </div>
  );
};

export default Appointments;
