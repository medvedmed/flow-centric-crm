
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Appointment } from '../../services/types';
import { CreateAppointmentPayload } from '../../types/api';
import { supabaseApi } from '../../services/supabaseApi';
import { useToast } from '../use-toast';

export const useAppointments = (
  clientId?: string,
  staffId?: string,
  startDate?: string,
  endDate?: string,
  page: number = 1,
  pageSize: number = 100
) => {
  return useQuery({
    queryKey: ['appointments', clientId, staffId, startDate, endDate, page, pageSize],
    queryFn: () => supabaseApi.getAppointments(clientId, staffId, startDate, endDate, page, pageSize),
    staleTime: 1 * 60 * 1000, // 1 minute for real-time updates
    placeholderData: (previousData) => previousData,
  });
};

export const useCreateAppointment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (appointment: CreateAppointmentPayload) => supabaseApi.createAppointment(appointment as Appointment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast({
        title: "Success",
        description: "Appointment created successfully!",
      });
    },
    onError: (error) => {
      console.error('Error creating appointment:', error);
      toast({
        title: "Error",
        description: "Failed to create appointment. Please try again.",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateAppointment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, appointment }: { id: string; appointment: Partial<Appointment> }) => 
      supabaseApi.updateAppointment(id, appointment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast({
        title: "Success",
        description: "Appointment updated successfully!",
      });
    },
    onError: (error) => {
      console.error('Error updating appointment:', error);
      toast({
        title: "Error",
        description: "Failed to update appointment. Please try again.",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteAppointment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => supabaseApi.deleteAppointment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast({
        title: "Success",
        description: "Appointment deleted successfully!",
      });
    },
    onError: (error) => {
      console.error('Error deleting appointment:', error);
      toast({
        title: "Error",
        description: "Failed to delete appointment. Please try again.",
        variant: "destructive",
      });
    },
  });
};
