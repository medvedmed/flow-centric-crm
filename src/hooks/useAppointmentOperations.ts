
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { supabaseApi } from '@/services/supabaseApi';
import { Appointment } from '@/services/types';

export const useAppointmentOperations = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const moveAppointmentMutation = useMutation({
    mutationFn: async ({ 
      appointmentId, 
      newStaffId, 
      newTime, 
      duration = 60 
    }: {
      appointmentId: string;
      newStaffId: string;
      newTime: string;
      duration?: number;
    }) => {
      // Calculate end time
      const startTime = new Date(`2000-01-01 ${newTime}`);
      const endTime = new Date(startTime.getTime() + duration * 60000);
      const endTimeString = endTime.toTimeString().slice(0, 5);

      // Update appointment
      return supabaseApi.updateAppointment(appointmentId, {
        staffId: newStaffId,
        startTime: newTime,
        endTime: endTimeString
      });
    },
    onMutate: async ({ appointmentId, newStaffId, newTime, duration = 60 }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['appointments-data'] });

      // Snapshot the previous value
      const previousAppointments = queryClient.getQueryData(['appointments-data']);

      // Optimistically update
      queryClient.setQueryData(['appointments-data'], (old: any) => {
        if (!old?.data) return old;
        
        return {
          ...old,
          data: old.data.map((apt: Appointment) => {
            if (apt.id === appointmentId) {
              const startTime = new Date(`2000-01-01 ${newTime}`);
              const endTime = new Date(startTime.getTime() + duration * 60000);
              return {
                ...apt,
                staffId: newStaffId,
                startTime: newTime,
                endTime: endTime.toTimeString().slice(0, 5)
              };
            }
            return apt;
          })
        };
      });

      return { previousAppointments };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousAppointments) {
        queryClient.setQueryData(['appointments-data'], context.previousAppointments);
      }
      
      toast({
        title: "Error Moving Appointment",
        description: "Failed to move appointment. Please try again.",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      toast({
        title: "Appointment Moved",
        description: "Appointment has been successfully moved.",
      });
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['appointments-data'] });
    },
  });

  return {
    moveAppointment: moveAppointmentMutation.mutate,
    isMoving: moveAppointmentMutation.isPending,
  };
};
