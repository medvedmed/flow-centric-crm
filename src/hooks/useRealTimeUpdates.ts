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
          queryClient.invalidateQueries({ queryKey: ['staff-performance'] });
          queryClient.invalidateQueries({ queryKey: ['enhanced-schedule-appointments'] });
          queryClient.invalidateQueries({ queryKey: ['retention-summary'] });
          queryClient.invalidateQueries({ queryKey: ['staff-retention-metrics'] });
          queryClient.invalidateQueries({ queryKey: ['client-retention-data'] });
        }
      )
      .subscribe();

    // Subscribe to appointment services changes
    const appointmentServicesChannel = supabase
      .channel('appointment-services-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointment_services'
        },
        (payload) => {
          console.log('Appointment services change:', payload);
          queryClient.invalidateQueries({ queryKey: ['appointment-services'] });
          queryClient.invalidateQueries({ queryKey: ['appointments'] });
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
          queryClient.invalidateQueries({ queryKey: ['staff-performance'] });
        }
      )
      .subscribe();

    // Subscribe to payment methods changes
    const paymentMethodsChannel = supabase
      .channel('payment-methods-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payment_methods'
        },
        (payload) => {
          console.log('Payment methods change:', payload);
          queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
        }
      )
      .subscribe();

    // Subscribe to financial transaction changes
    const financeChannel = supabase
      .channel('finance-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'financial_transactions'
        },
        (payload) => {
          console.log('Finance change:', payload);
          queryClient.invalidateQueries({ queryKey: ['financial-summary'] });
          queryClient.invalidateQueries({ queryKey: ['financial-transactions'] });
          queryClient.invalidateQueries({ queryKey: ['payment-method-stats'] });
          queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
        }
      )
      .subscribe();

    // Subscribe to audit logs changes
    const auditLogsChannel = supabase
      .channel('audit-logs-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'audit_logs'
        },
        (payload) => {
          console.log('Audit logs change:', payload);
          queryClient.invalidateQueries({ queryKey: ['audit-logs'] });
        }
      )
      .subscribe();

    // Subscribe to reminders changes
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
          queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
        }
      )
      .subscribe();

    // Subscribe to inventory changes
    const inventoryChannel = supabase
      .channel('inventory-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'inventory_items'
        },
        (payload) => {
          console.log('Inventory change:', payload);
          queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
          queryClient.invalidateQueries({ queryKey: ['inventory-categories'] });
          queryClient.invalidateQueries({ queryKey: ['low-stock-items'] });
        }
      )
      .subscribe();

    // Subscribe to client retention analytics changes
    const retentionChannel = supabase
      .channel('retention-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'client_retention_analytics'
        },
        (payload) => {
          console.log('Retention analytics change:', payload);
          queryClient.invalidateQueries({ queryKey: ['retention-summary'] });
          queryClient.invalidateQueries({ queryKey: ['staff-retention-metrics'] });
          queryClient.invalidateQueries({ queryKey: ['client-retention-data'] });
        }
      )
      .subscribe();

    // Subscribe to client payments changes
    const clientPaymentsChannel = supabase
      .channel('client-payments-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'client_payments'
        },
        (payload) => {
          console.log('Client payments change:', payload);
          queryClient.invalidateQueries({ queryKey: ['client-payments'] });
          queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(servicesChannel);
      supabase.removeChannel(appointmentsChannel);
      supabase.removeChannel(appointmentServicesChannel);
      supabase.removeChannel(clientsChannel);
      supabase.removeChannel(staffChannel);
      supabase.removeChannel(paymentMethodsChannel);
      supabase.removeChannel(financeChannel);
      supabase.removeChannel(auditLogsChannel);
      supabase.removeChannel(remindersChannel);
      supabase.removeChannel(analyticsChannel);
      supabase.removeChannel(inventoryChannel);
      supabase.removeChannel(retentionChannel);
      supabase.removeChannel(clientPaymentsChannel);
    };
  }, [queryClient]);

  return null;
};
