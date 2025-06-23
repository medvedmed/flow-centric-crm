
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useAppointmentData } from '@/hooks/useAppointmentData';
import { usePermissions } from '@/hooks/usePermissions';
import { AddAppointmentDialog } from './AddAppointmentDialog';
import DragDropScheduler from './DragDropScheduler';
import { format } from 'date-fns';

interface AppointmentSchedulerProps {
  selectedDate: Date;
  onAppointmentMove: (appointmentId: string, newStaffId: string, newTime: string) => void;
}

export const AppointmentScheduler: React.FC<AppointmentSchedulerProps> = ({
  selectedDate,
  onAppointmentMove
}) => {
  const dateString = format(selectedDate, 'yyyy-MM-dd');
  const { staff, appointments, isLoading, error, staffError, appointmentsError } = useAppointmentData(dateString);
  const { hasPermissionSync, userRole } = usePermissions();

  const canCreateAppointments = hasPermissionSync('appointments', 'create');
  const isStaff = userRole === 'staff';

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleAppointmentMove = (appointmentId: string, newStaffId: string, newTime: string) => {
    console.log('Moving appointment:', { appointmentId, newStaffId, newTime });
    onAppointmentMove(appointmentId, newStaffId, newTime);
  };

  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-white">
        <div className="animate-pulse text-center">
          <div className="h-8 bg-gray-200 rounded w-48 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-32 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-white p-8">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {staffError ? 'Error loading staff data. ' : ''}
            {appointmentsError ? 'Error loading appointment data. ' : ''}
            Please try refreshing the page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-hidden bg-white">
      <DragDropScheduler
        staff={staff}
        appointments={appointments}
        selectedDate={selectedDate}
        onAppointmentMove={handleAppointmentMove}
        onRefresh={handleRefresh}
      />
    </div>
  );
};
