
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Staff, Appointment } from '@/services/types';
import { useToast } from '@/hooks/use-toast';

export const useAppointmentData = (date: string) => {
  const { toast } = useToast();

  const { data: staff = [], isLoading: staffLoading, error: staffError } = useQuery({
    queryKey: ['staff'],
    queryFn: async (): Promise<Staff[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('staff')
        .select('*')
        .eq('salon_id', user.id)
        .eq('status', 'active')
        .order('name');
      
      if (error) throw error;
      
      return (data || []).map(staff => ({
        id: staff.id,
        name: staff.name,
        email: staff.email,
        phone: staff.phone,
        specialties: staff.specialties || [],
        workingHoursStart: staff.working_hours_start,
        workingHoursEnd: staff.working_hours_end,
        workingDays: staff.working_days || [],
        breakStart: staff.break_start,
        breakEnd: staff.break_end,
        efficiency: staff.efficiency || 100,
        rating: staff.rating || 5.0,
        imageUrl: staff.image_url,
        hourlyRate: staff.hourly_rate || 0,
        commissionRate: staff.commission_rate || 35,
        status: staff.status as Staff['status'],
        notes: staff.notes,
        hireDate: staff.hire_date,
        salonId: staff.salon_id,
        staffCode: staff.staff_code,
        staffLoginId: staff.staff_login_id,
        staffLoginPassword: staff.staff_login_password,
        createdAt: staff.created_at,
        updatedAt: staff.updated_at
      }));
    },
    staleTime: 30 * 1000,
    retry: 3,
  });

  const { data: appointments = [], isLoading: appointmentsLoading, error: appointmentsError } = useQuery({
    queryKey: ['appointments', date],
    queryFn: async (): Promise<Appointment[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const startOfDay = `${date}T00:00:00`;
      const endOfDay = `${date}T23:59:59`;

      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          clients!appointments_client_id_fkey(full_name, phone),
          services!appointments_service_id_fkey(name, price)
        `)
        .eq('organization_id', user.id)
        .gte('start_time', startOfDay)
        .lte('start_time', endOfDay)
        .order('start_time');
      
      if (error) throw error;
      
      return (data || []).map(apt => ({
        id: apt.id,
        clientId: apt.client_id,
        staffId: apt.staff_id,
        clientName: apt.clients?.full_name || 'Unknown',
        clientPhone: apt.clients?.phone,
        service: apt.services?.name || 'Service',
        startTime: apt.start_time?.split('T')[1]?.slice(0, 5) || '',
        endTime: apt.end_time?.split('T')[1]?.slice(0, 5) || '',
        date: apt.start_time?.split('T')[0] || date,
        price: apt.services?.price || 0,
        duration: apt.duration || 60,
        status: apt.status as Appointment['status'],
        notes: apt.notes,
        salonId: apt.organization_id,
        paymentStatus: 'unpaid' as const,
        createdAt: apt.created_at,
        updatedAt: apt.updated_at
      }));
    },
    staleTime: 15 * 1000,
    refetchInterval: 30 * 1000,
    retry: 3,
  });

  useEffect(() => {
    if (staffError) {
      toast({ title: "Staff Data Error", description: `Failed to load staff`, variant: "destructive" });
    }
    if (appointmentsError) {
      toast({ title: "Appointments Data Error", description: `Failed to load appointments`, variant: "destructive" });
    }
  }, [staffError, appointmentsError, toast]);

  return {
    staff,
    appointments,
    isLoading: staffLoading || appointmentsLoading,
    staffLoading,
    appointmentsLoading,
    error: staffError || appointmentsError,
  };
};
