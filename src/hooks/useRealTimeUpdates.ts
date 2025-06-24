
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

export const useRealTimeUpdates = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Subscribe to services changes
    const servicesChannel = supabase
      .channel('services-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'services'
        },
        (payload) => {
          console.log('Services change:', payload);
          queryClient.invalidateQueries({ queryKey: ['services'] });
        }
      )
      .subscribe();

    // Subscribe to appointments changes
    const appointmentsChannel = supabase
      .channel('appointments-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments'
        },
        (payload) => {
          console.log('Appointments change:', payload);
          queryClient.invalidateQueries({ queryKey: ['appointments'] });
          queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
        }
      )
      .subscribe();

    // Subscribe to clients changes
    const clientsChannel = supabase
      .channel('clients-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'clients'
        },
        (payload) => {
          console.log('Clients change:', payload);
          queryClient.invalidateQueries({ queryKey: ['clients'] });
          queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
        }
      )
      .subscribe();

    // Subscribe to staff changes
    const staffChannel = supabase
      .channel('staff-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'staff'
        },
        (payload) => {
          console.log('Staff change:', payload);
          queryClient.invalidateQueries({ queryKey: ['staff'] });
        }
      )
      .subscribe();

    // Subscribe to staff availability changes
    const staffAvailabilityChannel = supabase
      .channel('staff-availability-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'staff_availability'
        },
        (payload) => {
          console.log('Staff availability change:', payload);
          queryClient.invalidateQueries({ queryKey: ['staff-availability'] });
          queryClient.invalidateQueries({ queryKey: ['availability'] });
        }
      )
      .subscribe();

    // Subscribe to reminder changes
    const remindersChannel = supabase
      .channel('reminders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointment_reminders'
        },
        (payload) => {
          console.log('Reminders change:', payload);
          queryClient.invalidateQueries({ queryKey: ['appointment-reminders'] });
        }
      )
      .subscribe();

    // Subscribe to analytics changes
    const analyticsChannel = supabase
      .channel('analytics-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'business_analytics'
        },
        (payload) => {
          console.log('Analytics change:', payload);
          queryClient.invalidateQueries({ queryKey: ['business-analytics'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(servicesChannel);
      supabase.removeChannel(appointmentsChannel);
      supabase.removeChannel(clientsChannel);
      supabase.removeChannel(staffChannel);
      supabase.removeChannel(staffAvailabilityChannel);
      supabase.removeChannel(remindersChannel);
      supabase.removeChannel(analyticsChannel);
    };
  }, [queryClient]);

  return null;
};
