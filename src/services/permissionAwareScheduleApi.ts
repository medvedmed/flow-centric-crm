
import { supabase } from '@/integrations/supabase/client';
import { Appointment, Staff } from './types';
import { realTimeScheduleApi, ScheduleConflict } from './api/realTimeScheduleApi';
import { permissionApi, PermissionArea } from './permissionApi';

export interface PermissionAwareAppointmentResult {
  success: boolean;
  appointment?: Appointment;
  error?: string;
  conflicts?: ScheduleConflict[];
}

export const permissionAwareScheduleApi = {
  async getUserAccessibleStaff(): Promise<Staff[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Get user permissions
    const permissions = await permissionApi.getCurrentUserRole();
    
    let query = supabase.from('staff').select('*').eq('salon_id', user.id);

    // If user is staff, only return their own record
    if (permissions.role === 'staff') {
      const { data: userStaff } = await supabase
        .from('staff')
        .select('id')
        .eq('email', user.email)
        .single();
      
      if (userStaff) {
        query = query.eq('id', userStaff.id);
      } else {
        return []; // Staff member not found
      }
    }

    const { data, error } = await query.order('name');
    
    if (error) throw error;
    
    return data?.map(staff => ({
      id: staff.id,
      name: staff.name,
      email: staff.email,
      phone: staff.phone,
      specialties: staff.specialties,
      workingHoursStart: staff.working_hours_start,
      workingHoursEnd: staff.working_hours_end,
      workingDays: staff.working_days,
      breakStart: staff.break_start,
      breakEnd: staff.break_end,
      efficiency: staff.efficiency,
      rating: staff.rating,
      imageUrl: staff.image_url,
      hourlyRate: staff.hourly_rate,
      commissionRate: staff.commission_rate,
      status: staff.status as Staff['status'],
      notes: staff.notes,
      hireDate: staff.hire_date,
      salonId: staff.salon_id,
      createdAt: staff.created_at,
      updatedAt: staff.updated_at
    })) || [];
  },

  async getUserAccessibleAppointments(
    date?: string,
    staffId?: string
  ): Promise<Appointment[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Check permissions
    const hasViewPermission = await permissionApi.hasPermission('appointments', 'view');
    if (!hasViewPermission) {
      throw new Error('No permission to view appointments');
    }

    const permissions = await permissionApi.getCurrentUserRole();
    
    let query = supabase
      .from('appointments')
      .select('*')
      .eq('salon_id', user.id);

    // If user is staff, only show their own appointments
    if (permissions.role === 'staff') {
      const { data: userStaff } = await supabase
        .from('staff')
        .select('id')
        .eq('email', user.email)
        .single();
      
      if (userStaff) {
        query = query.eq('staff_id', userStaff.id);
      } else {
        return []; // Staff member not found
      }
    } else if (staffId) {
      query = query.eq('staff_id', staffId);
    }

    if (date) {
      query = query.eq('date', date);
    }

    const { data, error } = await query
      .order('date', { ascending: true })
      .order('start_time', { ascending: true });
    
    if (error) throw error;
    
    return data?.map(appointment => ({
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
      duration: appointment.duration,
      status: appointment.status as Appointment['status'],
      notes: appointment.notes,
      salonId: appointment.salon_id,
      createdAt: appointment.created_at,
      updatedAt: appointment.updated_at
    })) || [];
  },

  async createAppointmentWithValidation(
    appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt' | 'salonId'>
  ): Promise<PermissionAwareAppointmentResult> {
    // Check create permission
    const hasCreatePermission = await permissionApi.hasPermission('appointments', 'create');
    if (!hasCreatePermission) {
      return { success: false, error: 'No permission to create appointments' };
    }

    // Validate availability
    const availability = await realTimeScheduleApi.checkStaffAvailability(
      appointment.staffId,
      appointment.date,
      appointment.startTime,
      appointment.endTime
    );

    if (!availability.isAvailable) {
      return {
        success: false,
        error: 'Time slot not available',
        conflicts: availability.conflicts
      };
    }

    // Create appointment
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('appointments')
      .insert({
        client_id: appointment.clientId,
        staff_id: appointment.staffId,
        client_name: appointment.clientName,
        client_phone: appointment.clientPhone,
        service: appointment.service,
        start_time: appointment.startTime,
        end_time: appointment.endTime,
        date: appointment.date,
        price: appointment.price,
        duration: appointment.duration || 60,
        status: appointment.status || 'Scheduled',
        notes: appointment.notes,
        salon_id: user.id
      })
      .select()
      .single();
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return {
      success: true,
      appointment: {
        id: data.id,
        clientId: data.client_id,
        staffId: data.staff_id,
        clientName: data.client_name,
        clientPhone: data.client_phone,
        service: data.service,
        startTime: data.start_time,
        endTime: data.end_time,
        date: data.date,
        price: data.price,
        duration: data.duration,
        status: data.status as Appointment['status'],
        notes: data.notes,
        salonId: data.salon_id,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      }
    };
  },

  async moveAppointmentWithValidation(
    appointmentId: string,
    newStaffId: string,
    newDate: string,
    newStartTime: string,
    newEndTime: string
  ): Promise<PermissionAwareAppointmentResult> {
    // Check edit permission
    const hasEditPermission = await permissionApi.hasPermission('appointments', 'edit');
    if (!hasEditPermission) {
      return { success: false, error: 'No permission to edit appointments' };
    }

    // Validate the move
    const validation = await realTimeScheduleApi.validateAppointmentMove(
      appointmentId,
      newStaffId,
      newDate,
      newStartTime,
      newEndTime
    );

    if (!validation.isValid) {
      return {
        success: false,
        error: 'Cannot move appointment to this slot',
        conflicts: validation.conflicts
      };
    }

    // Update appointment
    const { data, error } = await supabase
      .from('appointments')
      .update({
        staff_id: newStaffId,
        date: newDate,
        start_time: newStartTime,
        end_time: newEndTime,
        updated_at: new Date().toISOString()
      })
      .eq('id', appointmentId)
      .select()
      .single();
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return {
      success: true,
      appointment: {
        id: data.id,
        clientId: data.client_id,
        staffId: data.staff_id,
        clientName: data.client_name,
        clientPhone: data.client_phone,
        service: data.service,
        startTime: data.start_time,
        endTime: data.end_time,
        date: data.date,
        price: data.price,
        duration: data.duration,
        status: data.status as Appointment['status'],
        notes: data.notes,
        salonId: data.salon_id,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      }
    };
  }
};
