import React, { createContext, useContext, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AutoRefreshContextType {
  refreshAppointments: () => void;
  refreshStaff: () => void;
  refreshClients: () => void;
  refreshServices: () => void;
}

const AutoRefreshContext = createContext<AutoRefreshContextType | undefined>(undefined);

export const useAutoRefresh = () => {
  const context = useContext(AutoRefreshContext);
  if (!context) {
    throw new Error('useAutoRefresh must be used within AutoRefreshProvider');
  }
  return context;
};

export const AutoRefreshProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const refreshCallbacks = useRef<{ [key: string]: (() => void)[] }>({
    appointments: [],
    staff: [],
    clients: [],
    services: []
  });

  const registerCallback = (type: string, callback: () => void) => {
    refreshCallbacks.current[type].push(callback);
    return () => {
      refreshCallbacks.current[type] = refreshCallbacks.current[type].filter(cb => cb !== callback);
    };
  };

  const refreshAppointments = () => {
    refreshCallbacks.current.appointments.forEach(callback => callback());
  };

  const refreshStaff = () => {
    refreshCallbacks.current.staff.forEach(callback => callback());
  };

  const refreshClients = () => {
    refreshCallbacks.current.clients.forEach(callback => callback());
  };

  const refreshServices = () => {
    refreshCallbacks.current.services.forEach(callback => callback());
  };

  useEffect(() => {
    if (!user) return;

    // Set up real-time subscriptions for automatic refresh
    const appointmentsChannel = supabase
      .channel('appointments-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments',
          filter: `salon_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Appointments change detected:', payload);
          refreshAppointments();
          
          // Show toast for important changes
          if (payload.eventType === 'INSERT') {
            toast({
              title: "New Appointment",
              description: "A new appointment has been created",
            });
          } else if (payload.eventType === 'UPDATE') {
            toast({
              title: "Appointment Updated",
              description: "An appointment has been modified",
            });
          }
        }
      )
      .subscribe();

    const staffChannel = supabase
      .channel('staff-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'staff',
          filter: `salon_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Staff change detected:', payload);
          refreshStaff();
        }
      )
      .subscribe();

    const clientsChannel = supabase
      .channel('clients-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'clients',
          filter: `salon_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Clients change detected:', payload);
          refreshClients();
        }
      )
      .subscribe();

    const servicesChannel = supabase
      .channel('services-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'services',
          filter: `salon_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Services change detected:', payload);
          refreshServices();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(appointmentsChannel);
      supabase.removeChannel(staffChannel);
      supabase.removeChannel(clientsChannel);
      supabase.removeChannel(servicesChannel);
    };
  }, [user, toast]);

  return (
    <AutoRefreshContext.Provider value={{
      refreshAppointments,
      refreshStaff,
      refreshClients,
      refreshServices
    }}>
      {children}
    </AutoRefreshContext.Provider>
  );
};