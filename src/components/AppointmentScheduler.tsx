
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
      <div className="w-full h-full bg-white rounded-xl shadow-lg border border-gray-200/60">
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
        <div className="p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="space-y-2">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
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
          <div className="text-center text-red-600">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">Error loading schedule data</p>
            <p className="text-sm text-gray-500 mt-2">Please try refreshing the page</p>
          </div>
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
      
      <div className="h-[calc(100%-80px)] overflow-hidden">
        {staff.length === 0 ? (
          <div className="p-8 text-center text-gray-500 h-full flex items-center justify-center">
            <div>
              <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No staff members found</p>
              <p className="text-sm mt-2">Please add staff members to view the schedule</p>
            </div>
          </div>
        ) : (
          <EnhancedScheduler
            date={dateString}
            onBookSlot={handleBookSlot}
            onAppointmentUpdate={refresh}
          />
        )}
      </div>
    </div>
  );
};
