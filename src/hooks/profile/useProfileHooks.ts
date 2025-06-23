
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Profile } from '../../services/types';
import { supabaseApi } from '../../services/supabaseApi';
import { useToast } from '../use-toast';

export const useProfile = () => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: () => supabaseApi.getProfile(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (profile: Partial<Profile>) => supabaseApi.updateProfile(profile),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
    },
    onError: (error) => {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });
};

export const useReminderSettings = () => {
  return useQuery({
    queryKey: ['reminder-settings'],
    queryFn: () => supabaseApi.getReminderSettings(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateReminderSettings = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (settings: any) => supabaseApi.createReminderSettings(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminder-settings'] });
      toast({
        title: "Success",
        description: "Reminder settings created successfully!",
      });
    },
    onError: (error) => {
      console.error('Error creating reminder settings:', error);
      toast({
        title: "Error",
        description: "Failed to create reminder settings. Please try again.",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateReminderSettings = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (settings: any) => supabaseApi.updateReminderSettings(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminder-settings'] });
      toast({
        title: "Success",
        description: "Reminder settings updated successfully!",
      });
    },
    onError: (error) => {
      console.error('Error updating reminder settings:', error);
      toast({
        title: "Error",
        description: "Failed to update reminder settings. Please try again.",
        variant: "destructive",
      });
    },
  });
};

export const useAppointmentReminders = (status?: string) => {
  return useQuery({
    queryKey: ['appointment-reminders', status],
    queryFn: () => supabaseApi.getAppointmentReminders(status),
    staleTime: 1 * 60 * 1000, // 1 minute for real-time updates
  });
};

export const useProcessReminders = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: () => supabaseApi.processReminders(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointment-reminders'] });
      toast({
        title: "Success",
        description: "Reminders processed successfully!",
      });
    },
    onError: (error) => {
      console.error('Error processing reminders:', error);
      toast({
        title: "Error",
        description: "Failed to process reminders. Please try again.",
        variant: "destructive",
      });
    },
  });
};
