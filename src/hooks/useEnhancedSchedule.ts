
import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { permissionAwareScheduleApi } from '@/services/permissionAwareScheduleApi';
import { realTimeScheduleApi } from '@/services/api/realTimeScheduleApi';
import { Appointment, Staff } from '@/services/types';
import { useToast } from '@/hooks/use-toast';

export const useEnhancedSchedule = (date: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get accessible staff
  const { data: staff = [], isLoading: staffLoading, error: staffError } = useQuery({
    queryKey: ['enhanced-schedule-staff'],
    queryFn: () => permissionAwareScheduleApi.getUserAccessibleStaff(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Get appointments for the date
  const { data: appointments = [], isLoading: appointmentsLoading, error: appointmentsError } = useQuery({
    queryKey: ['enhanced-schedule-appointments', date],
    queryFn: () => permissionAwareScheduleApi.getUserAccessibleAppointments(date),
    staleTime: 1 * 60 * 1000, // 1 minute for more real-time updates
  });

  // Create appointment mutation
  const createAppointmentMutation = useMutation({
    mutationFn: (appointment: Parameters<typeof permissionAwareScheduleApi.createAppointmentWithValidation>[0]) =>
      permissionAwareScheduleApi.createAppointmentWithValidation(appointment),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['enhanced-schedule-appointments'] });
        toast({
          title: "Appointment Created",
          description: "The appointment has been successfully created.",
        });
      } else {
        toast({
          title: "Booking Failed",
          description: result.error || "Failed to create appointment",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      console.error('Error creating appointment:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while creating the appointment",
        variant: "destructive",
      });
    }
  });

  // Move appointment mutation
  const moveAppointmentMutation = useMutation({
    mutationFn: (params: {
      appointmentId: string;
      newStaffId: string;
      newDate: string;
      newStartTime: string;
      newEndTime: string;
    }) => permissionAwareScheduleApi.moveAppointmentWithValidation(
      params.appointmentId,
      params.newStaffId,
      params.newDate,
      params.newStartTime,
      params.newEndTime
    ),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['enhanced-schedule-appointments'] });
        toast({
          title: "Appointment Moved",
          description: "The appointment has been successfully moved.",
        });
      } else {
        toast({
          title: "Cannot Move Appointment",
          description: result.error || "Failed to move appointment",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      console.error('Error moving appointment:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while moving the appointment",
        variant: "destructive",
      });
    }
  });

  // Check availability for a time slot
  const checkAvailability = useCallback(async (
    staffId: string,
    startTime: string,
    duration: number = 60
  ) => {
    const endTime = new Date(`2000-01-01 ${startTime}`);
    endTime.setMinutes(endTime.getMinutes() + duration);
    const endTimeString = endTime.toTimeString().slice(0, 5);

    return realTimeScheduleApi.checkStaffAvailability(staffId, date, startTime, endTimeString);
  }, [date]);

  // Get available slots for a staff member
  const getAvailableSlots = useCallback(async (
    staffId: string,
    serviceDuration: number = 60
  ) => {
    return realTimeScheduleApi.getAvailableSlots(staffId, date, serviceDuration);
  }, [date]);

  return {
    // Data
    staff,
    appointments,
    
    // Loading states
    isLoading: staffLoading || appointmentsLoading,
    staffLoading,
    appointmentsLoading,
    
    // Errors
    error: staffError || appointmentsError,
    staffError,
    appointmentsError,
    
    // Mutations
    createAppointment: createAppointmentMutation.mutate,
    moveAppointment: moveAppointmentMutation.mutate,
    isCreating: createAppointmentMutation.isPending,
    isMoving: moveAppointmentMutation.isPending,
    
    // Utility functions
    checkAvailability,
    getAvailableSlots,
    
    // Refresh function
    refresh: () => {
      queryClient.invalidateQueries({ queryKey: ['enhanced-schedule-staff'] });
      queryClient.invalidateQueries({ queryKey: ['enhanced-schedule-appointments'] });
    }
  };
};

export default useEnhancedSchedule;
