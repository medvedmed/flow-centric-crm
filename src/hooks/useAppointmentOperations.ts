
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

      // Check for conflicts first
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const appointmentDate = new Date().toISOString().split('T')[0]; // Today's date for now
      
      const { data: conflicts, error: conflictError } = await supabase
        .from('appointments')
        .select('id, client_name')
        .eq('salon_id', user.id)
        .eq('staff_id', newStaffId)
        .eq('date', appointmentDate)
        .eq('start_time', newTime)
        .neq('id', appointmentId);

      if (conflictError) {
        console.error('Conflict check error:', conflictError);
        throw new Error('Failed to check for appointment conflicts');
      }

      if (conflicts && conflicts.length > 0) {
        throw new Error(`Time slot already occupied by ${conflicts[0].client_name}`);
      }

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
      
      // Cancel any outgoing refetches for appointments
      await queryClient.cancelQueries({ queryKey: ['appointments-data'] });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData(['appointments-data']);

      // Optimistically update all appointment queries
      queryClient.setQueriesData(
        { queryKey: ['appointments-data'] },
        (oldData: any) => {
          if (!oldData || !Array.isArray(oldData)) return oldData;
          
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
        }
      );

      return { previousData };
    },
    onError: (err, variables, context) => {
      console.error('Move appointment error:', err);
      
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueriesData(['appointments-data'], context.previousData);
      }
      
      toast({
        title: "Error Moving Appointment",
        description: err instanceof Error ? err.message : "Failed to move appointment. Please try again.",
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
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });

  const createAppointmentMutation = useMutation({
    mutationFn: async (appointmentData: Partial<Appointment>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('appointments')
        .insert({
          ...appointmentData,
          salon_id: user.id,
          status: appointmentData.status || 'Scheduled'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments-data'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast({
        title: "Appointment Created",
        description: "New appointment has been successfully created.",
      });
    },
    onError: (error) => {
      console.error('Create appointment error:', error);
      toast({
        title: "Error Creating Appointment",
        description: "Failed to create appointment. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    moveAppointment: moveAppointmentMutation.mutate,
    isMoving: moveAppointmentMutation.isPending,
    createAppointment: createAppointmentMutation.mutate,
    isCreating: createAppointmentMutation.isPending,
  };
};
