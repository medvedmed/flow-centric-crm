
import React, { useState } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Calendar } from 'lucide-react';
import { AppointmentScheduler } from '@/components/AppointmentScheduler';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { SidebarToggle } from '@/components/SidebarToggle';
import { AppSidebar } from '@/components/AppSidebar';

const Appointments = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { hasPermissionSync } = usePermissions();

  const canViewAppointments = hasPermissionSync('appointments', 'view');

  const handleAppointmentMove = (appointmentId: string, newStaffId: string, newTime: string) => {
    console.log('Appointment move handled:', { appointmentId, newStaffId, newTime });
    // The actual database update is now handled by the useAppointmentOperations hook
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
    <div className="min-h-screen w-full bg-gray-50 flex">
      {/* Sidebar */}
      <AppSidebar />
      
      {/* Mobile Toggle */}
      <SidebarToggle />
      
      {/* Main Content */}
      <div className="flex-1 lg:ml-0 flex flex-col min-w-0">
        {/* Date Navigation Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 md:gap-4 min-w-0 flex-1">
            <div className="flex items-center gap-2 min-w-0">
              <Calendar className="w-5 h-5 text-gray-600 flex-shrink-0" />
              <h1 className="text-sm md:text-lg font-semibold text-gray-900 truncate">
                {format(selectedDate, 'EEEE, MMM d, yyyy')}
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
            <Button variant="outline" size="sm" onClick={goToPreviousDay}>
              <span className="hidden sm:inline">Previous</span>
              <span className="sm:hidden">←</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={goToToday}
              className="bg-teal-50 border-teal-200 text-teal-700 hover:bg-teal-100"
            >
              Today
            </Button>
            <Button variant="outline" size="sm" onClick={goToNextDay}>
              <span className="hidden sm:inline">Next</span>
              <span className="sm:hidden">→</span>
            </Button>
          </div>
        </div>

        {/* Main Scheduler */}
        <div className="flex-1 overflow-hidden p-2 md:p-4">
          <AppointmentScheduler
            selectedDate={selectedDate}
            onAppointmentMove={handleAppointmentMove}
          />
        </div>
      </div>
    </div>
  );
};

export default Appointments;
