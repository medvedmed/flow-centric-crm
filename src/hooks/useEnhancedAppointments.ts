
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { enhancedAppointmentApi } from '@/services/api/enhancedAppointmentApi';
import { useToast } from '@/hooks/use-toast';

export const useEnhancedAppointment = (appointmentId: string) => {
  return useQuery({
    queryKey: ['enhanced-appointment', appointmentId],
    queryFn: () => enhancedAppointmentApi.getAppointmentWithServices(appointmentId),
    enabled: !!appointmentId,
  });
};

export const useAppointmentServices = (appointmentId: string) => {
  return useQuery({
    queryKey: ['appointment-services', appointmentId],
    queryFn: () => enhancedAppointmentApi.getAppointmentServices(appointmentId),
    enabled: !!appointmentId,
  });
};

export const useAddServiceToAppointment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ appointmentId, service }: { appointmentId: string; service: any }) =>
      enhancedAppointmentApi.addServiceToAppointment(appointmentId, service),
    onSuccess: (_, { appointmentId }) => {
      queryClient.invalidateQueries({ queryKey: ['appointment-services', appointmentId] });
      queryClient.invalidateQueries({ queryKey: ['enhanced-appointment', appointmentId] });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast({
        title: "Service Added",
        description: "Service has been successfully added to the appointment.",
      });
    },
    onError: (error) => {
      console.error('Error adding service:', error);
      toast({
        title: "Error",
        description: "Failed to add service. Please try again.",
        variant: "destructive",
      });
    },
  });
};

export const useRemoveServiceFromAppointment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (serviceId: string) =>
      enhancedAppointmentApi.removeServiceFromAppointment(serviceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointment-services'] });
      queryClient.invalidateQueries({ queryKey: ['enhanced-appointment'] });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast({
        title: "Service Removed",
        description: "Service has been successfully removed from the appointment.",
      });
    },
    onError: (error) => {
      console.error('Error removing service:', error);
      toast({
        title: "Error",
        description: "Failed to remove service. Please try again.",
        variant: "destructive",
      });
    },
  });
};
