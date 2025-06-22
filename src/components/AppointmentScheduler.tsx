
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Plus, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { useEnhancedSchedule } from '@/hooks/useEnhancedSchedule';
import { usePermissions } from '@/hooks/usePermissions';
import DragDropScheduler from './DragDropScheduler';

interface AppointmentSchedulerProps {
  selectedDate: Date;
  onAppointmentMove: (appointmentId: string, newStaffId: string, newTime: string) => void;
}

export const AppointmentScheduler: React.FC<AppointmentSchedulerProps> = ({
  selectedDate,
  onAppointmentMove
}) => {
  const dateString = format(selectedDate, 'yyyy-MM-dd');
  const { staff, appointments, isLoading, error } = useEnhancedSchedule(dateString);
  const { hasPermissionSync, userRole } = usePermissions();

  const canCreateAppointments = hasPermissionSync('appointments', 'create');
  const isStaff = userRole === 'staff';

  // Generate time slots from 8 AM to 8 PM in 15-minute intervals
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour <= 20; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        if (hour === 20 && minute > 0) break; // Stop at 8:00 PM
        slots.push({
          time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
          hour,
          minute
        });
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

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
            <Button size="sm" className="gap-2 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700">
              <Plus className="w-4 h-4" />
              New Appointment
            </Button>
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
            <DragDropScheduler
              staff={staff}
              appointments={appointments}
              timeSlots={timeSlots}
              onAppointmentMove={onAppointmentMove}
              isReadOnly={isStaff} // Staff can only view, not edit
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
};
