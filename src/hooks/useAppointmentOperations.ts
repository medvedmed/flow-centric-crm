
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
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
      console.log('Moving appointment:', { appointmentId, newStaffId, newTime, duration });
      
      // Calculate end time
      const startTime = new Date(`2000-01-01 ${newTime}`);
      const endTime = new Date(startTime.getTime() + duration * 60000);
      const endTimeString = endTime.toTimeString().slice(0, 5);

      console.log('Calculated times:', { startTime: newTime, endTime: endTimeString });

      // Update appointment in database
      const { data, error } = await supabase
        .from('appointments')
        .update({
          staff_id: newStaffId,
          start_time: newTime,
          end_time: endTimeString,
          updated_at: new Date().toISOString()
        })
        .eq('id', appointmentId)
        .select()
        .single();

      if (error) {
        console.error('Database update error:', error);
        throw error;
      }

      console.log('Updated appointment:', data);
      return data;
    },
    onMutate: async ({ appointmentId, newStaffId, newTime, duration = 60 }) => {
      console.log('Optimistic update starting...');
      
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['appointments-data'] });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData(['appointments-data']);

      // Optimistically update
      queryClient.setQueryData(['appointments-data'], (oldData: any) => {
        if (!oldData) return oldData;
        
        return oldData.map((apt: Appointment) => {
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
        });
      });

      return { previousData };
    },
    onError: (err, variables, context) => {
      console.error('Move appointment error:', err);
      
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(['appointments-data'], context.previousData);
      }
      
      toast({
        title: "Error Moving Appointment",
        description: "Failed to move appointment. Please try again.",
        variant: "destructive",
      });
    },
    onSuccess: (data, variables) => {
      console.log('Appointment moved successfully:', data);
      
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
