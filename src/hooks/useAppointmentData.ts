
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Staff, Appointment } from '@/services/types';
import { useToast } from '@/hooks/use-toast';

export const useAppointmentData = (date: string) => {
  const { toast } = useToast();

  // Fetch staff data
  const { data: staff = [], isLoading: staffLoading, error: staffError } = useQuery({
    queryKey: ['staff-data'],
    queryFn: async (): Promise<Staff[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('staff')
        .select('*')
        .eq('salon_id', user.id)
        .eq('status', 'active')
        .order('name');
      
      if (error) {
        console.error('Staff fetch error:', error);
        throw error;
      }
      
      return data?.map(staff => ({
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
      })) || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch appointments for the specific date
  const { data: appointments = [], isLoading: appointmentsLoading, error: appointmentsError } = useQuery({
    queryKey: ['appointments-data', date],
    queryFn: async (): Promise<Appointment[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      console.log('Fetching appointments for date:', date);

      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('salon_id', user.id)
        .eq('date', date)
        .order('start_time');
      
      if (error) {
        console.error('Appointments fetch error:', error);
        throw error;
      }
      
      console.log('Raw appointments data:', data);
      
      const mappedAppointments = data?.map(appointment => ({
        id: appointment.id,
        clientId: appointment.client_id,
        staffId: appointment.staff_id,
        clientName: appointment.client_name,
        clientPhone: appointment.client_phone,
        service: appointment.service,
        startTime: appointment.start_time,
        endTime: appointment.end_time,
        date: appointment.date,
        price: appointment.price,
        duration: appointment.duration || 60,
        status: appointment.status as Appointment['status'],
        notes: appointment.notes,
        salonId: appointment.salon_id,
        createdAt: appointment.created_at,
        updatedAt: appointment.updated_at
      })) || [];

      console.log('Mapped appointments:', mappedAppointments);
      return mappedAppointments;
    },
    staleTime: 1 * 60 * 1000, // 1 minute for appointments
    refetchInterval: 30 * 1000, // Refetch every 30 seconds for real-time updates
  });

  // Show error messages
  useEffect(() => {
    if (staffError) {
      console.error('Staff loading error:', staffError);
      toast({
        title: "Error Loading Staff",
        description: "Unable to load staff data. Please refresh the page.",
        variant: "destructive",
      });
    }
    if (appointmentsError) {
      console.error('Appointments loading error:', appointmentsError);
      toast({
        title: "Error Loading Appointments",
        description: "Unable to load appointment data. Please refresh the page.",
        variant: "destructive",
      });
    }
  }, [staffError, appointmentsError, toast]);

  return {
    staff,
    appointments,
    isLoading: staffLoading || appointmentsLoading,
    staffLoading,
    appointmentsLoading,
    error: staffError || appointmentsError,
    staffError,
    appointmentsError,
  };
};
