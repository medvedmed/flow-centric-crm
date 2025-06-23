
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TimeOffRequest, StaffAvailability } from '../../services/types';
import { supabaseApi } from '../../services/supabaseApi';
import { useToast } from '../use-toast';

export const useTimeOffRequests = (staffId?: string, status?: string) => {
  return useQuery({
    queryKey: ['timeOffRequests', staffId, status],
    queryFn: () => supabaseApi.getTimeOffRequests(staffId, status),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useCreateTimeOffRequest = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (request: TimeOffRequest) => supabaseApi.createTimeOffRequest(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeOffRequests'] });
      toast({
        title: "Success",
        description: "Time-off request created successfully!",
      });
    },
    onError: (error) => {
      console.error('Error creating time-off request:', error);
      toast({
        title: "Error",
        description: "Failed to create time-off request. Please try again.",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateTimeOffRequest = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, request }: { id: string; request: Partial<TimeOffRequest> }) => 
      supabaseApi.updateTimeOffRequest(id, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeOffRequests'] });
      toast({
        title: "Success",
        description: "Time-off request updated successfully!",
      });
    },
    onError: (error) => {
      console.error('Error updating time-off request:', error);
      toast({
        title: "Error",
        description: "Failed to update time-off request. Please try again.",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteTimeOffRequest = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => supabaseApi.deleteTimeOffRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeOffRequests'] });
      toast({
        title: "Success",
        description: "Time-off request deleted successfully!",
      });
    },
    onError: (error) => {
      console.error('Error deleting time-off request:', error);
      toast({
        title: "Error",
        description: "Failed to delete time-off request. Please try again.",
        variant: "destructive",
      });
    },
  });
};

export const useStaffAvailability = (staffId?: string, date?: string) => {
  return useQuery({
    queryKey: ['staffAvailability', staffId, date],
    queryFn: () => supabaseApi.getStaffAvailability(staffId, date),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useCreateStaffAvailability = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (availability: StaffAvailability) => supabaseApi.createStaffAvailability(availability),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staffAvailability'] });
      toast({
        title: "Success",
        description: "Staff availability updated successfully!",
      });
    },
    onError: (error) => {
      console.error('Error creating staff availability:', error);
      toast({
        title: "Error",
        description: "Failed to update staff availability. Please try again.",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateStaffAvailability = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, availability }: { id: string; availability: Partial<StaffAvailability> }) => 
      supabaseApi.updateStaffAvailability(id, availability),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staffAvailability'] });
      toast({
        title: "Success",
        description: "Staff availability updated successfully!",
      });
    },
    onError: (error) => {
      console.error('Error updating staff availability:', error);
      toast({
        title: "Error",
        description: "Failed to update staff availability. Please try again.",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteStaffAvailability = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => supabaseApi.deleteStaffAvailability(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staffAvailability'] });
      toast({
        title: "Success",
        description: "Staff availability deleted successfully!",
      });
    },
    onError: (error) => {
      console.error('Error deleting staff availability:', error);
      toast({
        title: "Error",
        description: "Failed to delete staff availability. Please try again.",
        variant: "destructive",
      });
    },
  });
};
