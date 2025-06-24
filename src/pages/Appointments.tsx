
import React, { useState } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Calendar, Grid3X3, CalendarDays } from 'lucide-react';
import { AppointmentScheduler } from '@/components/AppointmentScheduler';
import { EditAppointmentDialog } from '@/components/EditAppointmentDialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { Appointment } from '@/services/types';
import DragDropCalendar from '@/components/DragDropCalendar';

const Appointments = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const { hasPermissionSync } = usePermissions();

  const canViewAppointments = hasPermissionSync('appointments', 'view');

  const handleAppointmentClick = (appointment: Appointment) => {
    setEditingAppointment(appointment);
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
    <div className="h-screen w-full overflow-hidden bg-white flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-600" />
            <h1 className="text-lg font-semibold text-gray-900">
              Appointments
            </h1>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToPreviousDay}>
            Previous
          </Button>
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
          <Button variant="outline" size="sm" onClick={goToNextDay}>
            Next
          </Button>
        </div>
      </div>

      {/* Main Content with Tabs */}
      <div className="flex-1 overflow-hidden p-4">
        <Tabs defaultValue="grid" className="w-full h-full flex flex-col">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="grid" className="flex items-center gap-2">
              <Grid3X3 className="w-4 h-4" />
              Grid View
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4" />
              Calendar View
            </TabsTrigger>
          </TabsList>

          <TabsContent value="grid" className="flex-1 overflow-hidden mt-4">
            <div className="bg-white border-b border-gray-200 px-4 py-2 mb-4">
              <h2 className="text-md font-medium text-gray-800">
                {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </h2>
            </div>
            <AppointmentScheduler
              selectedDate={selectedDate}
              onAppointmentClick={handleAppointmentClick}
            />
          </TabsContent>

          <TabsContent value="calendar" className="flex-1 overflow-hidden mt-4">
            <DragDropCalendar onAppointmentClick={handleAppointmentClick} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Appointment Dialog */}
      <EditAppointmentDialog
        appointment={editingAppointment}
        isOpen={!!editingAppointment}
        onClose={() => setEditingAppointment(null)}
      />
    </div>
  );
};

export default Appointments;
