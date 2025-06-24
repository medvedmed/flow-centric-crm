import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useAppointmentData } from '@/hooks/useAppointmentData';
import { useAuth } from '@/hooks/useAuth';
import EnhancedInteractiveScheduler from './EnhancedInteractiveScheduler';
import { AppointmentErrorBoundary } from './AppointmentErrorBoundary';
import { format } from 'date-fns';

interface AppointmentSchedulerProps {
  selectedDate: Date;
  onAppointmentMove?: (appointmentId: string, newStaffId: string, newTime: string) => void;
}

export const AppointmentScheduler: React.FC<AppointmentSchedulerProps> = ({
  selectedDate,
  onAppointmentMove
}) => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const dateString = format(selectedDate, 'yyyy-MM-dd');
  const { staff, appointments, isLoading, error, staffError, appointmentsError } = useAppointmentData(dateString);

  // Enhanced data mapping with proper property normalization
  console.log('AppointmentScheduler - Raw Data:', {
    dateString,
    staffCount: staff?.length || 0,
    appointmentCount: appointments?.length || 0,
    isLoading,
    error,
    rawStaff: staff,
    rawAppointments: appointments
  });

  // Normalize appointment data to ensure consistent property names
  const normalizedAppointments = appointments?.map(apt => ({
    ...apt,
    // Ensure camelCase properties are available (the interface already uses camelCase)
    clientName: apt.clientName || 'Unknown Client',
    startTime: apt.startTime || '09:00',
    endTime: apt.endTime || '10:00',
    staffId: apt.staffId || '',
    clientPhone: apt.clientPhone || ''
  })) || [];

  console.log('AppointmentScheduler - Normalized Data:', {
    normalizedCount: normalizedAppointments.length,
    appointments: normalizedAppointments.map(a => ({ 
      id: a.id, 
      client: a.clientName, 
      time: a.startTime,
      staffId: a.staffId 
    }))
  });

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleAppointmentUpdate = () => {
    console.log('Appointment updated - triggering refresh');
    if (onAppointmentMove) {
      // Trigger any parent refresh logic if needed
    }
  };

  // Show loading if auth is still loading
  if (authLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-white">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading authentication...</span>
        </div>
      </div>
    );
  }

  // Show auth error if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-white p-8">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Authentication required. Please log in to view appointments.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

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
            Please try refreshing the page or contact support if the issue persists.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <AppointmentErrorBoundary>
      <EnhancedInteractiveScheduler
        staff={staff || []}
        appointments={normalizedAppointments}
        selectedDate={selectedDate}
        onAppointmentUpdate={handleAppointmentUpdate}
      />
    </AppointmentErrorBoundary>
  );
};
