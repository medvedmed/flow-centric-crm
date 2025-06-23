
import { supabase } from '@/integrations/supabase/client';
import { Staff, Appointment } from './types';
import { realTimeScheduleApi } from './api/realTimeScheduleApi';
import { permissionApi } from './permissionApi';

interface BookingResult {
  success: boolean;
  error?: string;
  appointment?: Appointment;
}

interface MoveResult {
  success: boolean;
  error?: string;
}

export const permissionAwareScheduleApi = {
  async getUserAccessibleStaff(): Promise<Staff[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Get user role to determine access
    const userRole = await permissionApi.getCurrentUserRole();
    
    let query = supabase
      .from('staff')
      .select('*')
      .eq('salon_id', user.id)
      .eq('status', 'active');

    // If user is staff, only show their own record
    if (userRole?.role === 'staff') {
      query = query.eq('email', user.email);
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
      staffCode: staff.staff_code,
      staffLoginId: staff.staff_login_id,
      staffLoginPassword: staff.staff_login_password,
      createdAt: staff.created_at,
      updatedAt: staff.updated_at
    })) || [];
  },

  async getUserAccessibleAppointments(date: string): Promise<Appointment[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Get user role to determine access
    const userRole = await permissionApi.getCurrentUserRole();
    
    let query = supabase
      .from('appointments')
      .select('*')
      .eq('salon_id', user.id)
      .eq('date', date);

    // If user is staff, only show their own appointments
    if (userRole?.role === 'staff') {
      // Get staff record to filter by staff_id
      const { data: staffData } = await supabase
        .from('staff')
        .select('id')
        .eq('salon_id', user.id)
        .eq('email', user.email)
        .single();
      
      if (staffData) {
        query = query.eq('staff_id', staffData.id);
      }
    }

    const { data, error } = await query.order('start_time');
    
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

  async createAppointmentWithValidation(appointment: {
    clientId?: string;
    clientName: string;
    clientPhone?: string;
    staffId: string;
    service: string;
    date: string;
    startTime: string;
    duration: number;
    price: number;
    notes?: string;
  }): Promise<BookingResult> {
    try {
      // Check if user has permission to create appointments
      const hasPermission = await permissionApi.hasPermission('appointments', 'create');
      if (!hasPermission) {
        return { success: false, error: 'You do not have permission to create appointments' };
      }

      // Calculate end time
      const endTime = new Date(`2000-01-01 ${appointment.startTime}`);
      endTime.setMinutes(endTime.getMinutes() + appointment.duration);
      const endTimeString = endTime.toTimeString().slice(0, 5);

      // Check staff availability
      const availability = await realTimeScheduleApi.checkStaffAvailability(
        appointment.staffId,
        appointment.date,
        appointment.startTime,
        endTimeString
      );

      if (!availability.isAvailable) {
        return { 
          success: false, 
          error: `Time slot not available: ${availability.conflicts[0]?.message || 'Scheduling conflict'}` 
        };
      }

      // Create the appointment
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('appointments')
        .insert({
          client_id: appointment.clientId,
          staff_id: appointment.staffId,
          client_name: appointment.clientName,
          client_phone: appointment.clientPhone,
          service: appointment.service,
          start_time: appointment.startTime,
          end_time: endTimeString,
          date: appointment.date,
          price: appointment.price,
          duration: appointment.duration,
          status: 'Scheduled',
          notes: appointment.notes,
          salon_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      const createdAppointment: Appointment = {
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
      };

      return { success: true, appointment: createdAppointment };
    } catch (error) {
      console.error('Error creating appointment:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create appointment' 
      };
    }
  },

  async moveAppointmentWithValidation(
    appointmentId: string,
    newStaffId: string,
    newDate: string,
    newStartTime: string,
    newEndTime: string
  ): Promise<MoveResult> {
    try {
      // Check if user has permission to edit appointments
      const hasPermission = await permissionApi.hasPermission('appointments', 'edit');
      if (!hasPermission) {
        return { success: false, error: 'You do not have permission to edit appointments' };
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
          error: validation.conflicts[0]?.message || 'Cannot move appointment to this time slot' 
        };
      }

      // Update the appointment
      const { error } = await supabase
        .from('appointments')
        .update({
          staff_id: newStaffId,
          date: newDate,
          start_time: newStartTime,
          end_time: newEndTime,
          updated_at: new Date().toISOString()
        })
        .eq('id', appointmentId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Error moving appointment:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to move appointment' 
      };
    }
  }
};
