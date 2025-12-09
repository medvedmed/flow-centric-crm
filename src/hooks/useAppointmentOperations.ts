
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Appointment } from '@/services/types';

export const useAppointmentOperations = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth();

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
      if (!isAuthenticated || !user) {
        throw new Error('Authentication required');
      }

      console.log('Moving appointment:', { appointmentId, newStaffId, newTime, duration });
      
      // Calculate end time
      const startTime = new Date(`2000-01-01 ${newTime}`);
      const endTime = new Date(startTime.getTime() + duration * 60000);
      const endTimeString = endTime.toTimeString().slice(0, 5);

      console.log('Calculated times:', { startTime: newTime, endTime: endTimeString });

      // Check for conflicts first
      const appointmentDate = new Date().toISOString().split('T')[0];
      
      const { data: conflicts, error: conflictError } = await supabase
        .from('appointments')
        .select('id, client_id')
        .eq('organization_id', user.id)
        .eq('staff_id', newStaffId)
        .eq('start_time', newTime)
        .neq('id', appointmentId);

      if (conflictError) {
        console.error('Conflict check error:', conflictError);
        throw new Error('Failed to check for appointment conflicts');
      }

      if (conflicts && conflicts.length > 0) {
        throw new Error('Time slot already occupied');
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
      
      await queryClient.cancelQueries({ queryKey: ['appointments'] });
      const previousData = queryClient.getQueryData(['appointments']);

      queryClient.setQueriesData(
        { queryKey: ['appointments'] },
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
      
      if (context?.previousData) {
        queryClient.setQueriesData({ queryKey: ['appointments'] }, context.previousData);
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
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['staff-performance'] });
    },
  });

  const createAppointmentMutation = useMutation({
    mutationFn: async (appointmentData: Partial<Appointment> & { 
      extraServices?: Array<{ id: string; name: string; price: number; duration: number }> 
    }) => {
      if (!isAuthenticated || !user) {
        throw new Error('Authentication required');
      }

      const baseDuration = appointmentData.duration || 60;
      const extraServicesDuration = appointmentData.extraServices?.reduce((sum, service) => sum + service.duration, 0) || 0;
      const totalDuration = baseDuration + extraServicesDuration;

      const dbAppointmentData: any = {
        client_id: appointmentData.clientId,
        start_time: appointmentData.startTime || '',
        end_time: appointmentData.endTime || '',
        duration: totalDuration,
        staff_id: appointmentData.staffId,
        notes: appointmentData.notes,
        organization_id: user.id,
        status: appointmentData.status || 'Scheduled'
      };

      const { data, error } = await supabase
        .from('appointments')
        .insert(dbAppointmentData)
        .select()
        .single();

      if (error) throw error;

      if (appointmentData.extraServices && appointmentData.extraServices.length > 0) {
        const serviceInserts = appointmentData.extraServices.map(service => ({
          appointment_id: data.id,
          service_name: service.name,
          service_price: service.price,
          service_duration: service.duration,
          staff_id: appointmentData.staffId
        }));

        const { error: servicesError } = await supabase
          .from('appointment_services')
          .insert(serviceInserts);
        
        if (servicesError) {
          console.error('Error adding extra services:', servicesError);
        }
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['staff-performance'] });
      toast({
        title: "Appointment Created",
        description: "New appointment has been successfully created.",
      });
    },
    onError: (error) => {
      console.error('Create appointment error:', error);
      toast({
        title: "Error Creating Appointment",
        description: error instanceof Error ? error.message : "Failed to create appointment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updatePaymentStatusMutation = useMutation({
    mutationFn: async ({ 
      appointmentId, 
      paymentStatus, 
      paymentMethod, 
      amount 
    }: {
      appointmentId: string;
      paymentStatus: 'paid' | 'unpaid' | 'partial';
      paymentMethod?: string;
      amount?: number;
    }) => {
      if (!isAuthenticated || !user) {
        throw new Error('Authentication required');
      }

      const { data: appointment, error: appointmentError } = await supabase
        .from('appointments')
        .update({
          status: paymentStatus === 'paid' ? 'Completed' : 'Scheduled',
          updated_at: new Date().toISOString()
        })
        .eq('id', appointmentId)
        .select(`
          *,
          clients(full_name),
          services(name)
        `)
        .single();

      if (appointmentError) throw appointmentError;

      if (paymentStatus === 'paid' && amount) {
        const serviceName = appointment.services?.name || 'Service';
        const clientName = appointment.clients?.full_name || 'Client';
        
        const { error: transactionError } = await supabase
          .from('financial_transactions')
          .insert({
            salon_id: user.id,
            transaction_type: 'income',
            category: 'Service Revenue',
            amount: amount,
            description: `Payment for ${serviceName} - ${clientName}`,
            payment_method: paymentMethod || 'cash',
            reference_id: appointmentId,
            reference_type: 'appointment',
            transaction_date: new Date().toISOString().split('T')[0],
            created_by: user.id
          });

        if (transactionError) {
          console.error('Error creating financial transaction:', transactionError);
        }
      }

      return appointment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['financial-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast({
        title: "Payment Updated",
        description: "Payment status has been successfully updated.",
      });
    },
    onError: (error) => {
      console.error('Update payment error:', error);
      toast({
        title: "Error Updating Payment",
        description: error instanceof Error ? error.message : "Failed to update payment. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    moveAppointment: moveAppointmentMutation.mutate,
    isMoving: moveAppointmentMutation.isPending,
    createAppointment: createAppointmentMutation.mutate,
    isCreating: createAppointmentMutation.isPending,
    updatePaymentStatus: updatePaymentStatusMutation.mutate,
    isUpdatingPayment: updatePaymentStatusMutation.isPending,
  };
};
