
import { supabase } from '@/integrations/supabase/client';
import { Appointment, Staff, StaffAvailability } from '../types';
import { addMinutes, format, parseISO, isWithinInterval } from 'date-fns';

export interface ScheduleConflict {
  type: 'overlap' | 'outside_hours' | 'on_break' | 'time_off';
  message: string;
  conflictingAppointment?: Appointment;
}

export interface AvailabilitySlot {
  staffId: string;
  staffName: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  reason?: string;
}

export const realTimeScheduleApi = {
  async checkStaffAvailability(
    staffId: string, 
    date: string, 
    startTime: string, 
    endTime: string
  ): Promise<{ isAvailable: boolean; conflicts: ScheduleConflict[] }> {
    const conflicts: ScheduleConflict[] = [];

    // Get staff working hours
    const { data: staff, error: staffError } = await supabase
      .from('staff')
      .select('working_hours_start, working_hours_end, break_start, break_end, working_days')
      .eq('id', staffId)
      .single();

    if (staffError || !staff) {
      return { isAvailable: false, conflicts: [{ type: 'outside_hours', message: 'Staff not found' }] };
    }

    // Check if date is within working days
    const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
    if (!staff.working_days?.includes(dayOfWeek)) {
      conflicts.push({ type: 'outside_hours', message: `Staff doesn't work on ${dayOfWeek}` });
    }

    // Check working hours
    if (staff.working_hours_start && staff.working_hours_end) {
      if (startTime < staff.working_hours_start || endTime > staff.working_hours_end) {
        conflicts.push({ 
          type: 'outside_hours', 
          message: `Outside working hours (${staff.working_hours_start} - ${staff.working_hours_end})` 
        });
      }
    }

    // Check break time
    if (staff.break_start && staff.break_end) {
      const appointmentStart = startTime;
      const appointmentEnd = endTime;
      const breakStart = staff.break_start;
      const breakEnd = staff.break_end;

      if ((appointmentStart >= breakStart && appointmentStart < breakEnd) ||
          (appointmentEnd > breakStart && appointmentEnd <= breakEnd) ||
          (appointmentStart < breakStart && appointmentEnd > breakEnd)) {
        conflicts.push({ 
          type: 'on_break', 
          message: `Conflicts with break time (${breakStart} - ${breakEnd})` 
        });
      }
    }

    // Check existing appointments
    const { data: appointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select('*')
      .eq('staff_id', staffId)
      .gte('start_time', `${date}T00:00:00`)
      .lte('start_time', `${date}T23:59:59`)
      .neq('status', 'Cancelled');

    if (!appointmentsError && appointments) {
      // Get related data
      const clientIds = [...new Set(appointments.map(a => a.client_id).filter(Boolean))];
      const serviceIds = [...new Set(appointments.map(a => a.service_id).filter(Boolean))];
      
      const [clientsRes, servicesRes] = await Promise.all([
        clientIds.length > 0 ? supabase.from('clients').select('id, full_name, phone').in('id', clientIds) : { data: [] },
        serviceIds.length > 0 ? supabase.from('services').select('id, name, price').in('id', serviceIds) : { data: [] }
      ]);
      
      const clientsMap = new Map((clientsRes.data || []).map(c => [c.id, c]));
      const servicesMap = new Map((servicesRes.data || []).map(s => [s.id, s]));

      for (const appointment of appointments) {
        const aptStartTime = appointment.start_time?.split('T')[1]?.slice(0, 5) || appointment.start_time;
        const aptEndTime = appointment.end_time?.split('T')[1]?.slice(0, 5) || appointment.end_time;
        const client = appointment.client_id ? clientsMap.get(appointment.client_id) : null;
        const service = appointment.service_id ? servicesMap.get(appointment.service_id) : null;
        
        if ((startTime >= aptStartTime && startTime < aptEndTime) ||
            (endTime > aptStartTime && endTime <= aptEndTime) ||
            (startTime < aptStartTime && endTime > aptEndTime)) {
          conflicts.push({
            type: 'overlap',
            message: `Conflicts with existing appointment: ${client?.full_name || 'Client'} (${aptStartTime} - ${aptEndTime})`,
            conflictingAppointment: {
              id: appointment.id,
              clientId: appointment.client_id,
              staffId: appointment.staff_id,
              clientName: client?.full_name || '',
              clientPhone: client?.phone || '',
              service: service?.name || '',
              startTime: appointment.start_time,
              endTime: appointment.end_time,
              date: appointment.start_time?.split('T')[0] || '',
              price: service?.price || 0,
              duration: appointment.duration,
              status: appointment.status as Appointment['status'],
              notes: appointment.notes,
              salonId: appointment.organization_id,
              createdAt: appointment.created_at,
              updatedAt: appointment.updated_at
            }
          });
        }
      }
    }

    // Check time off requests
    const { data: timeOffRequests, error: timeOffError } = await supabase
      .from('time_off_requests')
      .select('*')
      .eq('staff_id', staffId)
      .eq('status', 'approved')
      .lte('start_date', date)
      .gte('end_date', date);

    if (!timeOffError && timeOffRequests && timeOffRequests.length > 0) {
      conflicts.push({
        type: 'time_off',
        message: 'Staff has approved time off on this date'
      });
    }

    return {
      isAvailable: conflicts.length === 0,
      conflicts
    };
  },

  async getAvailableSlots(
    staffId: string, 
    date: string, 
    serviceDuration: number = 60
  ): Promise<AvailabilitySlot[]> {
    const slots: AvailabilitySlot[] = [];

    // Get staff info
    const { data: staff } = await supabase
      .from('staff')
      .select('name, working_hours_start, working_hours_end')
      .eq('id', staffId)
      .single();

    if (!staff || !staff.working_hours_start || !staff.working_hours_end) {
      return slots;
    }

    // Generate 15-minute slots
    const startHour = parseInt(staff.working_hours_start.split(':')[0]);
    const startMinute = parseInt(staff.working_hours_start.split(':')[1]);
    const endHour = parseInt(staff.working_hours_end.split(':')[0]);
    const endMinute = parseInt(staff.working_hours_end.split(':')[1]);

    for (let hour = startHour; hour < endHour || (hour === endHour && 0 < endMinute); hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        if (hour === endHour && minute >= endMinute) break;
        if (hour === startHour && minute < startMinute) continue;

        const slotStart = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const endTime = addMinutes(new Date(`2000-01-01 ${slotStart}`), serviceDuration);
        const slotEnd = format(endTime, 'HH:mm');

        const availability = await this.checkStaffAvailability(staffId, date, slotStart, slotEnd);

        slots.push({
          staffId,
          staffName: staff.name,
          startTime: slotStart,
          endTime: slotEnd,
          isAvailable: availability.isAvailable,
          reason: availability.conflicts.length > 0 ? availability.conflicts[0].message : undefined
        });
      }
    }

    return slots;
  },

  async validateAppointmentMove(
    appointmentId: string,
    newStaffId: string,
    newDate: string,
    newStartTime: string,
    newEndTime: string
  ): Promise<{ isValid: boolean; conflicts: ScheduleConflict[] }> {
    // Check availability for the new slot
    const availability = await this.checkStaffAvailability(newStaffId, newDate, newStartTime, newEndTime);
    
    // Filter out conflicts with the appointment being moved
    const filteredConflicts = availability.conflicts.filter(conflict => 
      conflict.conflictingAppointment?.id !== appointmentId
    );

    return {
      isValid: filteredConflicts.length === 0,
      conflicts: filteredConflicts
    };
  }
};
