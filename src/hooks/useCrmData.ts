
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  supabaseApi, 
  Client, 
  Appointment, 
  Staff, 
  Profile, 
  TimeOffRequest, 
  StaffAvailability
} from '../services/supabaseApi';
import { PaginatedResult } from '../services/types';
import { CreateClientPayload, CreateAppointmentPayload, CreateStaffPayload } from '../types/api';
import { useToast } from './use-toast';

// Profile hooks
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

// Enhanced client hooks with pagination
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
    placeholderData: (previousData) => previousData, // Replaces keepPreviousData
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

// Enhanced staff hooks
export const useStaff = (status?: string) => {
  return useQuery({
    queryKey: ['staff', status],
    queryFn: () => supabaseApi.getStaff(status),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateStaff = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (staff: CreateStaffPayload) => supabaseApi.createStaff(staff as Staff),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      toast({
        title: "Success",
        description: "Staff member created successfully!",
      });
    },
    onError: (error) => {
      console.error('Error creating staff:', error);
      toast({
        title: "Error",
        description: "Failed to create staff member. Please try again.",
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
      supabaseApi.updateStaff(id, staff),
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
    mutationFn: (id: string) => supabaseApi.deleteStaff(id),
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

// Enhanced appointment hooks with date filtering
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
    placeholderData: (previousData) => previousData, // Replaces keepPreviousData
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

// New Time-off Request hooks
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

// Staff Availability hooks
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

// New analytics hooks
export const useClientStats = () => {
  return useQuery({
    queryKey: ['client-stats'],
    queryFn: () => supabaseApi.getClientStats(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Reminder hooks
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

// Cache management utilities
export const useCacheManagement = () => {
  const queryClient = useQueryClient();

  const invalidateAllData = () => {
    queryClient.invalidateQueries({ queryKey: ['clients'] });
    queryClient.invalidateQueries({ queryKey: ['staff'] });
    queryClient.invalidateQueries({ queryKey: ['appointments'] });
    queryClient.invalidateQueries({ queryKey: ['client-stats'] });
  };

  const prefetchClients = (page: number, searchTerm?: string) => {
    queryClient.prefetchQuery({
      queryKey: ['clients', searchTerm, page, 50],
      queryFn: () => supabaseApi.getClients(searchTerm, page, 50),
      staleTime: 2 * 60 * 1000,
    });
  };

  return {
    invalidateAllData,
    prefetchClients,
  };
};
