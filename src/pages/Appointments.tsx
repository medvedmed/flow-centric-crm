
import React, { useState } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { Card, CardContent } from '@/components/ui/card';
import { Shield } from 'lucide-react';
import { AppointmentScheduler } from '@/components/AppointmentScheduler';

const Appointments = () => {
  const [selectedDate] = useState<Date>(new Date());
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
    <div className="h-screen w-full overflow-hidden bg-white">
      <AppointmentScheduler
        selectedDate={selectedDate}
        onAppointmentMove={handleAppointmentMove}
      />
    </div>
  );
};

export default Appointments;
