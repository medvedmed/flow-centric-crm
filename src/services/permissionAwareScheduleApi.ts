
import { supabase } from '@/integrations/supabase/client';
import { Staff, Appointment } from './types';
import { realTimeScheduleApi } from './api/realTimeScheduleApi';
import { permissionApi } from './permissionApi';

interface BookingResult { success: boolean; error?: string; appointment?: Appointment; }
interface MoveResult { success: boolean; error?: string; }

export const permissionAwareScheduleApi = {
  async getUserAccessibleStaff(): Promise<Staff[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    const userRole = await permissionApi.getCurrentUserRole();
    
    let query = supabase.from('staff').select('*').eq('salon_id', user.id).eq('status', 'active');
    if (userRole?.role === 'staff') query = query.eq('email', user.email);
    const { data, error } = await query.order('name');
    if (error) throw error;
    
    return (data || []).map(s => ({
      id: s.id, name: s.name, email: s.email, phone: s.phone, specialties: s.specialties,
      workingHoursStart: s.working_hours_start, workingHoursEnd: s.working_hours_end, workingDays: s.working_days,
      breakStart: s.break_start, breakEnd: s.break_end, efficiency: s.efficiency, rating: s.rating,
      imageUrl: s.image_url, hourlyRate: s.hourly_rate, commissionRate: s.commission_rate, status: s.status,
      notes: s.notes, hireDate: s.hire_date, salonId: s.salon_id, staffCode: s.staff_code,
      staffLoginId: s.staff_login_id, staffLoginPassword: s.staff_login_password,
      createdAt: s.created_at, updatedAt: s.updated_at
    }));
  },

  async getUserAccessibleAppointments(date: string): Promise<Appointment[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    const userRole = await permissionApi.getCurrentUserRole();
    
    let query = supabase.from('appointments').select('*').eq('organization_id', user.id).gte('start_time', `${date}T00:00:00`).lte('start_time', `${date}T23:59:59`);
    if (userRole?.role === 'staff') {
      const { data: staffData } = await supabase.from('staff').select('id').eq('salon_id', user.id).eq('email', user.email).single();
      if (staffData) query = query.eq('staff_id', staffData.id);
    }
    const { data, error } = await query.order('start_time');
    if (error) throw error;
    
    return (data || []).map(a => ({
      id: a.id, clientId: a.client_id || '', staffId: a.staff_id || '', clientName: '', clientPhone: '',
      service: '', startTime: a.start_time, endTime: a.end_time, date: a.start_time?.split('T')[0] || '',
      price: 0, duration: a.duration, status: a.status as Appointment['status'], notes: a.notes || '',
      salonId: a.organization_id || '', createdAt: a.created_at || '', updatedAt: a.updated_at || ''
    }));
  },

  async createAppointmentWithValidation(appointment: any): Promise<BookingResult> {
    try {
      const hasPermission = await permissionApi.hasPermission('appointments', 'create');
      if (!hasPermission) return { success: false, error: 'No permission to create appointments' };

      const endTime = new Date(`2000-01-01 ${appointment.startTime}`);
      endTime.setMinutes(endTime.getMinutes() + appointment.duration);
      const endTimeString = endTime.toTimeString().slice(0, 5);

      const availability = await realTimeScheduleApi.checkStaffAvailability(appointment.staffId, appointment.date, appointment.startTime, endTimeString);
      if (!availability.isAvailable) return { success: false, error: availability.conflicts[0]?.message || 'Scheduling conflict' };

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase.from('appointments').insert({
        client_id: appointment.clientId, staff_id: appointment.staffId,
        start_time: appointment.startTime, end_time: endTimeString, duration: appointment.duration,
        status: 'Scheduled', notes: appointment.notes, organization_id: user.id
      }).select().single();

      if (error) throw error;
      return { success: true, appointment: { id: data.id, clientId: data.client_id || '', staffId: data.staff_id || '', clientName: '', clientPhone: '', service: '', startTime: data.start_time, endTime: data.end_time, date: data.start_time?.split('T')[0] || '', price: 0, duration: data.duration, status: data.status as Appointment['status'], notes: data.notes || '', salonId: data.organization_id || '', createdAt: data.created_at || '', updatedAt: data.updated_at || '' } };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to create appointment' };
    }
  },

  async moveAppointmentWithValidation(appointmentId: string, newStaffId: string, newDate: string, newStartTime: string, newEndTime: string): Promise<MoveResult> {
    try {
      const hasPermission = await permissionApi.hasPermission('appointments', 'edit');
      if (!hasPermission) return { success: false, error: 'No permission to edit appointments' };

      const validation = await realTimeScheduleApi.validateAppointmentMove(appointmentId, newStaffId, newDate, newStartTime, newEndTime);
      if (!validation.isValid) return { success: false, error: validation.conflicts[0]?.message || 'Cannot move appointment' };

      const { error } = await supabase.from('appointments').update({ staff_id: newStaffId, start_time: newStartTime, end_time: newEndTime, updated_at: new Date().toISOString() }).eq('id', appointmentId);
      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to move appointment' };
    }
  }
};
