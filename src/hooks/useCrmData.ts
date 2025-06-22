
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabaseApi, Client, Appointment } from '../services/supabaseApi';
import { useToast } from './use-toast';

// Client hooks
export const useClients = (searchTerm?: string) => {
  return useQuery({
    queryKey: ['clients', searchTerm],
    queryFn: () => supabaseApi.getClients(searchTerm),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useClient = (id: string) => {
  return useQuery({
    queryKey: ['client', id],
    queryFn: () => supabaseApi.getClient(id),
    enabled: !!id,
  });
};

export const useCreateClient = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (client: Client) => supabaseApi.createClient(client),
    onSuccess: async (createdClient) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      
      toast({
        title: "Success",
        description: "Client created successfully!",
      });
    },
    onError: (error) => {
      console.error('Error creating client:', error);
      toast({
        title: "Error",
        description: "Failed to create client. Please try again.",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateClient = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, client }: { id: string; client: Partial<Client> }) => 
      supabaseApi.updateClient(id, client),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast({
        title: "Success",
        description: "Client updated successfully!",
      });
    },
    onError: (error) => {
      console.error('Error updating client:', error);
      toast({
        title: "Error",
        description: "Failed to update client. Please try again.",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteClient = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => supabaseApi.deleteClient(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast({
        title: "Success",
        description: "Client deleted successfully!",
      });
    },
    onError: (error) => {
      console.error('Error deleting client:', error);
      toast({
        title: "Error",
        description: "Failed to delete client. Please try again.",
        variant: "destructive",
      });
    },
  });
};

// Appointment hooks
export const useAppointments = (clientId?: string, staffId?: string) => {
  return useQuery({
    queryKey: ['appointments', clientId, staffId],
    queryFn: () => supabaseApi.getAppointments(clientId, staffId),
    staleTime: 2 * 60 * 1000, // 2 minutes for more frequent updates
  });
};

export const useCreateAppointment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (appointment: Appointment) => supabaseApi.createAppointment(appointment),
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
