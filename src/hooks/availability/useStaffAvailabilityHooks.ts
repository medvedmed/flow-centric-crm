
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { staffAvailabilityApi } from '@/services/api/staffAvailabilityApi';
import { StaffAvailability } from '@/services/types';
import { toast } from '@/hooks/use-toast';

// Query keys
export const staffAvailabilityKeys = {
  all: ['staff-availability'] as const,
  lists: () => [...staffAvailabilityKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...staffAvailabilityKeys.lists(), filters] as const,
  details: () => [...staffAvailabilityKeys.all, 'detail'] as const,
  detail: (id: string) => [...staffAvailabilityKeys.details(), id] as const,
  range: (staffId: string, startDate: string, endDate: string) => 
    [...staffAvailabilityKeys.all, 'range', staffId, startDate, endDate] as const,
  check: (staffId: string, date: string, startTime?: string, endTime?: string) =>
    [...staffAvailabilityKeys.all, 'check', staffId, date, startTime, endTime] as const,
};

// Hooks
export const useStaffAvailability = (
  staffId?: string,
  date?: string,
  startDate?: string,
  endDate?: string,
  page: number = 1,
  pageSize: number = 50
) => {
  return useQuery({
    queryKey: staffAvailabilityKeys.list({ staffId, date, startDate, endDate, page, pageSize }),
    queryFn: () => staffAvailabilityApi.getStaffAvailability(staffId, date, startDate, endDate, page, pageSize),
  });
};

export const useAvailabilityById = (id: string) => {
  return useQuery({
    queryKey: staffAvailabilityKeys.detail(id),
    queryFn: () => staffAvailabilityApi.getAvailabilityById(id),
    enabled: !!id,
  });
};

export const useAvailabilityRange = (staffId: string, startDate: string, endDate: string) => {
  return useQuery({
    queryKey: staffAvailabilityKeys.range(staffId, startDate, endDate),
    queryFn: () => staffAvailabilityApi.getAvailabilityRange(staffId, startDate, endDate),
    enabled: !!staffId && !!startDate && !!endDate,
  });
};

export const useCheckAvailability = (
  staffId: string,
  date: string,
  startTime?: string,
  endTime?: string
) => {
  return useQuery({
    queryKey: staffAvailabilityKeys.check(staffId, date, startTime, endTime),
    queryFn: () => staffAvailabilityApi.checkAvailability(staffId, date, startTime, endTime),
    enabled: !!staffId && !!date,
  });
};

export const useCreateStaffAvailability = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (availability: Omit<StaffAvailability, 'id' | 'salon_id' | 'created_at' | 'updated_at'>) =>
      staffAvailabilityApi.createStaffAvailability(availability),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: staffAvailabilityKeys.all });
      toast({
        title: "Success",
        description: "Availability record created successfully!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create availability record",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateStaffAvailability = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, availability }: { id: string; availability: Partial<StaffAvailability> }) =>
      staffAvailabilityApi.updateStaffAvailability(id, availability),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: staffAvailabilityKeys.all });
      toast({
        title: "Success",
        description: "Availability updated successfully!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update availability",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteStaffAvailability = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => staffAvailabilityApi.deleteStaffAvailability(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: staffAvailabilityKeys.all });
      toast({
        title: "Success",
        description: "Availability record deleted successfully!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete availability record",
        variant: "destructive",
      });
    },
  });
};

export const useBulkCreateAvailability = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (availabilityRecords: Omit<StaffAvailability, 'id' | 'salon_id' | 'created_at' | 'updated_at'>[]) =>
      staffAvailabilityApi.bulkCreateAvailability(availabilityRecords),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: staffAvailabilityKeys.all });
      toast({
        title: "Success",
        description: `${data.length} availability records created successfully!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create availability records",
        variant: "destructive",
      });
    },
  });
};
