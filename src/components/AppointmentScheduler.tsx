
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Calendar, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { useAppointmentData } from '@/hooks/useAppointmentData';
import { usePermissions } from '@/hooks/usePermissions';
import SimpleScheduler from './SimpleScheduler';
import { AddAppointmentDialog } from './AddAppointmentDialog';
import { Alert, AlertDescription } from '@/components/ui/alert';

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

  if (isLoading) {
    return (
      <div className="w-full h-full bg-white rounded-xl shadow-lg border border-gray-200/60">
        <div className="p-6 border-b border-gray-200/60 bg-gradient-to-r from-white to-gray-50/50">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-800">
              {isStaff ? 'My Schedule' : 'Schedule'} - {format(selectedDate, 'EEEE, MMMM dd, yyyy')}
            </h2>
          </div>
        </div>
        <div className="p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-96 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full bg-white rounded-xl shadow-lg border border-gray-200/60">
        <div className="p-6 border-b border-gray-200/60 bg-gradient-to-r from-white to-gray-50/50">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-800">
              {isStaff ? 'My Schedule' : 'Schedule'} - {format(selectedDate, 'EEEE, MMMM dd, yyyy')}
            </h2>
          </div>
        </div>
        <div className="p-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {staffError ? 'Error loading staff data. ' : ''}
              {appointmentsError ? 'Error loading appointment data. ' : ''}
              Please try refreshing the page.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-white rounded-xl shadow-lg border border-gray-200/60 overflow-hidden">
      <div className="p-6 border-b border-gray-200/60 bg-gradient-to-r from-white to-gray-50/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-800">
              {isStaff ? 'My Schedule' : 'Schedule'} - {format(selectedDate, 'EEEE, MMMM dd, yyyy')}
            </h2>
          </div>
          {canCreateAppointments && !isStaff && (
            <AddAppointmentDialog selectedDate={selectedDate} />
          )}
        </div>
        {isStaff && (
          <p className="text-sm text-gray-600 mt-2">View your appointments and client information</p>
        )}
      </div>
      
      <div className="p-6 h-[calc(100%-80px)] overflow-auto">
        <SimpleScheduler
          staff={staff}
          appointments={appointments}
          selectedDate={selectedDate}
          onRefresh={handleRefresh}
        />
      </div>
    </div>
  );
};
