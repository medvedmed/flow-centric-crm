
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Staff } from '../../services/types';
import { CreateStaffPayload } from '../../types/api';
import { staffApi } from '../../services/api/staffApi';
import { useToast } from '../use-toast';

export const useStaff = (status?: string) => {
  return useQuery({
    queryKey: ['staff', status],
    queryFn: () => staffApi.getStaff(status),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateStaff = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (staff: CreateStaffPayload) => {
      console.log('Creating staff with payload:', staff);
      return staffApi.createStaff(staff as Staff);
    },
    onSuccess: (data) => {
      console.log('Staff created successfully:', data);
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      toast({
        title: "Success",
        description: "Staff member created successfully with login credentials!",
      });
    },
    onError: (error: any) => {
      console.error('Error creating staff:', error);
      const errorMessage = error?.message || 'Failed to create staff member';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });
};

export const useUpdateStaff = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, staff }: { id: string; staff: Partial<Staff> }) => 
      staffApi.updateStaff(id, staff),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      toast({
        title: "Success",
        description: "Staff member updated successfully!",
      });
    },
    onError: (error) => {
      console.error('Error updating staff:', error);
      toast({
        title: "Error",
        description: "Failed to update staff member. Please try again.",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteStaff = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => staffApi.deleteStaff(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      toast({
        title: "Success",
        description: "Staff member deleted successfully!",
      });
    },
    onError: (error) => {
      console.error('Error deleting staff:', error);
      toast({
        title: "Error",
        description: "Failed to delete staff member. Please try again.",
        variant: "destructive",
      });
    },
  });
};
