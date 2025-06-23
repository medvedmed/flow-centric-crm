
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Client, PaginatedResult } from '../../services/types';
import { CreateClientPayload } from '../../types/api';
import { supabaseApi } from '../../services/supabaseApi';
import { useToast } from '../use-toast';

export const useClients = (
  searchTerm?: string,
  page: number = 1,
  pageSize: number = 50,
  status?: string
) => {
  return useQuery({
    queryKey: ['clients', searchTerm, page, pageSize, status],
    queryFn: () => supabaseApi.getClients(searchTerm, page, pageSize, status),
    staleTime: 2 * 60 * 1000, // 2 minutes for frequent updates
    placeholderData: (previousData) => previousData,
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
    mutationFn: (client: CreateClientPayload) => supabaseApi.createClient(client as Client),
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

export const useClientStats = () => {
  return useQuery({
    queryKey: ['client-stats'],
    queryFn: () => supabaseApi.getClientStats(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};
