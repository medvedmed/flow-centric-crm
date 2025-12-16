
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Staff, Appointment } from '@/services/types';
import { useToast } from '@/hooks/use-toast';
import { getUserOrgId } from '@/services/api/helpers';

export const useAppointmentData = (date: string) => {
  const { toast } = useToast();

  const { data: staff = [], isLoading: staffLoading, error: staffError } = useQuery({
    queryKey: ['staff'],
    queryFn: async (): Promise<Staff[]> => {
      const orgId = await getUserOrgId();

      const { data, error } = await supabase
        .from('staff')
        .select('*')
        .eq('salon_id', orgId)
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
      const orgId = await getUserOrgId();

      const startOfDay = `${date}T00:00:00`;
      const endOfDay = `${date}T23:59:59`;

      // First get appointments
      const { data: aptsData, error: aptsError } = await supabase
        .from('appointments')
        .select('*')
        .eq('organization_id', orgId)
        .gte('start_time', startOfDay)
        .lte('start_time', endOfDay)
        .order('start_time');
      
      if (aptsError) throw aptsError;
      
      // Get unique client and service IDs
      const clientIds = [...new Set((aptsData || []).map(a => a.client_id).filter(Boolean))];
      const serviceIds = [...new Set((aptsData || []).map(a => a.service_id).filter(Boolean))];
      
      // Fetch clients and services separately
      const [clientsRes, servicesRes] = await Promise.all([
        clientIds.length > 0 
          ? supabase.from('clients').select('id, full_name, phone').in('id', clientIds)
          : { data: [], error: null },
        serviceIds.length > 0
          ? supabase.from('services').select('id, name, price').in('id', serviceIds)
          : { data: [], error: null }
      ]);

      const clientsMap = new Map((clientsRes.data || []).map(c => [c.id, c]));
      const servicesMap = new Map((servicesRes.data || []).map(s => [s.id, s]));
      
      return (aptsData || []).map(apt => {
        const client = apt.client_id ? clientsMap.get(apt.client_id) : null;
        const service = apt.service_id ? servicesMap.get(apt.service_id) : null;
        
        return {
          id: apt.id,
          clientId: apt.client_id,
          staffId: apt.staff_id,
          clientName: client?.full_name || 'Unknown',
          clientPhone: client?.phone,
          service: service?.name || 'Service',
          startTime: apt.start_time?.split('T')[1]?.slice(0, 5) || '',
          endTime: apt.end_time?.split('T')[1]?.slice(0, 5) || '',
          date: apt.start_time?.split('T')[0] || date,
          price: service?.price || 0,
          duration: apt.duration || 60,
          status: apt.status as Appointment['status'],
          notes: apt.notes,
          salonId: apt.organization_id,
          paymentStatus: 'unpaid' as const,
          createdAt: apt.created_at,
          updatedAt: apt.updated_at
        };
      });
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
