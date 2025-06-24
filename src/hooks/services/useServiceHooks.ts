
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { serviceApi } from '@/services/api/serviceApi';
import { Service } from '@/services/types';
import { toast } from '@/hooks/use-toast';

// Query keys
export const serviceKeys = {
  all: ['services'] as const,
  lists: () => [...serviceKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...serviceKeys.lists(), filters] as const,
  details: () => [...serviceKeys.all, 'detail'] as const,
  detail: (id: string) => [...serviceKeys.details(), id] as const,
  categories: () => [...serviceKeys.all, 'categories'] as const,
};

// Hooks
export const useServices = (
  searchTerm?: string,
  category?: string,
  isActive?: boolean,
  page: number = 1,
  pageSize: number = 50
) => {
  return useQuery({
    queryKey: serviceKeys.list({ searchTerm, category, isActive, page, pageSize }),
    queryFn: () => serviceApi.getServices(searchTerm, category, isActive, page, pageSize),
  });
};

export const useService = (id: string) => {
  return useQuery({
    queryKey: serviceKeys.detail(id),
    queryFn: () => serviceApi.getService(id),
    enabled: !!id,
  });
};

export const useServiceCategories = () => {
  return useQuery({
    queryKey: serviceKeys.categories(),
    queryFn: () => serviceApi.getCategories(),
  });
};

export const useCreateService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (service: Omit<Service, 'id' | 'salon_id' | 'created_at' | 'updated_at'>) =>
      serviceApi.createService(service),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: serviceKeys.all });
      toast({
        title: "Success",
        description: "Service created successfully!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create service",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, service }: { id: string; service: Partial<Service> }) =>
      serviceApi.updateService(id, service),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: serviceKeys.all });
      toast({
        title: "Success",
        description: "Service updated successfully!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update service",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => serviceApi.deleteService(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: serviceKeys.all });
      toast({
        title: "Success",
        description: "Service deleted successfully!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete service",
        variant: "destructive",
      });
    },
  });
};

export const useToggleServicePopular = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, popular }: { id: string; popular: boolean }) =>
      serviceApi.togglePopular(id, popular),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: serviceKeys.all });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update service",
        variant: "destructive",
      });
    },
  });
};

export const useBulkUpdateServices = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ids, updates }: { ids: string[]; updates: Partial<Service> }) =>
      serviceApi.bulkUpdateServices(ids, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: serviceKeys.all });
      toast({
        title: "Success",
        description: "Services updated successfully!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update services",
        variant: "destructive",
      });
    },
  });
};
