
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
          queryClient.invalidateQueries({ queryKey: ['income-categories'] });
          queryClient.invalidateQueries({ queryKey: ['expense-categories'] });
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

    // Subscribe to receipt templates changes
    const receiptTemplatesChannel = supabase
      .channel('receipt-templates-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'receipt_templates'
        },
        (payload) => {
          console.log('Receipt templates change:', payload);
          queryClient.invalidateQueries({ queryKey: ['receipt-templates'] });
          queryClient.invalidateQueries({ queryKey: ['default-receipt-template'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(servicesChannel);
      supabase.removeChannel(appointmentsChannel);
      supabase.removeChannel(clientsChannel);
      supabase.removeChannel(staffChannel);
      supabase.removeChannel(inventoryChannel);
      supabase.removeChannel(financeChannel);
      supabase.removeChannel(appointmentServicesChannel);
      supabase.removeChannel(receiptTemplatesChannel);
    };
  }, [queryClient]);

  return null;
};
