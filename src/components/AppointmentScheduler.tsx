
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { useEnhancedSchedule } from '@/hooks/useEnhancedSchedule';
import { usePermissions } from '@/hooks/usePermissions';
import EnhancedScheduler from './EnhancedScheduler';
import { AddAppointmentDialog } from './AddAppointmentDialog';

interface AppointmentSchedulerProps {
  selectedDate: Date;
  onAppointmentMove: (appointmentId: string, newStaffId: string, newTime: string) => void;
}

export const AppointmentScheduler: React.FC<AppointmentSchedulerProps> = ({
  selectedDate,
  onAppointmentMove
}) => {
  const dateString = format(selectedDate, 'yyyy-MM-dd');
  const { staff, appointments, isLoading, error, refresh } = useEnhancedSchedule(dateString);
  const { hasPermissionSync, userRole } = usePermissions();

  const canCreateAppointments = hasPermissionSync('appointments', 'create');
  const isStaff = userRole === 'staff';

  const handleBookSlot = (slot: { staffId: string; time: string; staffName: string }) => {
    console.log('Booking slot:', slot);
    // This will be handled by the AddAppointmentDialog when integrated
  };

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Schedule - {format(selectedDate, 'EEEE, MMMM dd, yyyy')}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="space-y-2">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Schedule - {format(selectedDate, 'EEEE, MMMM dd, yyyy')}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Error loading schedule data</p>
            <p className="text-sm text-gray-500 mt-2">Please try refreshing the page</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            {isStaff ? 'My Schedule' : 'Schedule'} - {format(selectedDate, 'EEEE, MMMM dd, yyyy')}
          </CardTitle>
          {canCreateAppointments && !isStaff && (
            <AddAppointmentDialog selectedDate={selectedDate} />
          )}
        </div>
        {isStaff && (
          <p className="text-sm text-gray-600 mt-1">View your appointments and client information</p>
        )}
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-[600px] overflow-auto">
          {staff.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No staff members found</p>
              <p className="text-sm mt-2">Please add staff members to view the schedule</p>
            </div>
          ) : (
            <EnhancedScheduler
              date={dateString}
              onBookSlot={handleBookSlot}
              onAppointmentUpdate={refresh}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
};
