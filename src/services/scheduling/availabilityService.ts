
import { format, parse, addMinutes, isSameDay } from 'date-fns';
import { timeUtils } from '@/utils/timeUtils';

export interface TimeSlot {
  time: string;
  available: boolean;
  reason?: string;
}

export interface StaffAvailability {
  staffId: string;
  workingHoursStart: string;
  workingHoursEnd: string;
  breakStart?: string;
  breakEnd?: string;
  workingDays: string[];
}

export interface ExistingAppointment {
  startTime: string;
  endTime: string;
  staffId: string;
  date: string;
}

export class AvailabilityService {
  /**
   * Get available time slots for a specific staff member on a specific date
   */
  static getAvailableTimeSlots(
    date: Date,
    staffId: string,
    staffAvailability: StaffAvailability,
    existingAppointments: ExistingAppointment[] = [],
    serviceDuration: number = 60
  ): TimeSlot[] {
    const dayName = format(date, 'EEEE').toLowerCase();
    
    // Check if staff works on this day
    if (!staffAvailability.workingDays.includes(dayName)) {
      return [];
    }

    const allSlots = timeUtils.generateTimeSlots(
      parseInt(staffAvailability.workingHoursStart.split(':')[0]),
      parseInt(staffAvailability.workingHoursEnd.split(':')[0]),
      15 // 15-minute intervals
    );

    const dateString = format(date, 'yyyy-MM-dd');
    const dayAppointments = existingAppointments.filter(apt => apt.date === dateString && apt.staffId === staffId);

    return allSlots.map(time => {
      const slot: TimeSlot = {
        time,
        available: true
      };

      // Check if slot is within working hours
      if (!this.isWithinWorkingHours(time, staffAvailability)) {
        slot.available = false;
        slot.reason = 'Outside working hours';
        return slot;
      }

      // Check if slot conflicts with break time
      if (this.isWithinBreakTime(time, staffAvailability)) {
        slot.available = false;
        slot.reason = 'Break time';
        return slot;
      }

      // Check if slot has enough time for the service
      if (!this.hasEnoughTimeForService(time, serviceDuration, staffAvailability, dayAppointments)) {
        slot.available = false;
        slot.reason = 'Insufficient time for service';
        return slot;
      }

      // Check for appointment conflicts
      const conflict = this.hasAppointmentConflict(time, serviceDuration, dayAppointments);
      if (conflict) {
        slot.available = false;
        slot.reason = 'Appointment conflict';
      }

      return slot;
    });
  }

  private static isWithinWorkingHours(time: string, availability: StaffAvailability): boolean {
    const timeMinutes = this.timeToMinutes(time);
    const startMinutes = this.timeToMinutes(availability.workingHoursStart);
    const endMinutes = this.timeToMinutes(availability.workingHoursEnd);
    
    return timeMinutes >= startMinutes && timeMinutes < endMinutes;
  }

  private static isWithinBreakTime(time: string, availability: StaffAvailability): boolean {
    if (!availability.breakStart || !availability.breakEnd) {
      return false;
    }

    const timeMinutes = this.timeToMinutes(time);
    const breakStartMinutes = this.timeToMinutes(availability.breakStart);
    const breakEndMinutes = this.timeToMinutes(availability.breakEnd);
    
    return timeMinutes >= breakStartMinutes && timeMinutes < breakEndMinutes;
  }

  private static hasEnoughTimeForService(
    startTime: string,
    duration: number,
    availability: StaffAvailability,
    appointments: ExistingAppointment[]
  ): boolean {
    const endTime = timeUtils.calculateEndTime(startTime, duration);
    const endMinutes = this.timeToMinutes(endTime);
    const workingEndMinutes = this.timeToMinutes(availability.workingHoursEnd);
    
    // Check if service extends beyond working hours
    if (endMinutes > workingEndMinutes) {
      return false;
    }

    // Check if service conflicts with break time
    if (availability.breakStart && availability.breakEnd) {
      const breakStartMinutes = this.timeToMinutes(availability.breakStart);
      const startMinutes = this.timeToMinutes(startTime);
      
      if (startMinutes < breakStartMinutes && endMinutes > breakStartMinutes) {
        return false;
      }
    }

    return true;
  }

  private static hasAppointmentConflict(
    startTime: string,
    duration: number,
    appointments: ExistingAppointment[]
  ): boolean {
    const endTime = timeUtils.calculateEndTime(startTime, duration);
    
    return appointments.some(apt => {
      return (
        (startTime >= apt.startTime && startTime < apt.endTime) ||
        (endTime > apt.startTime && endTime <= apt.endTime) ||
        (startTime <= apt.startTime && endTime >= apt.endTime)
      );
    });
  }

  private static timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Find the next available slot for a service
   */
  static findNextAvailableSlot(
    date: Date,
    staffId: string,
    staffAvailability: StaffAvailability,
    existingAppointments: ExistingAppointment[],
    serviceDuration: number = 60
  ): string | null {
    const availableSlots = this.getAvailableTimeSlots(
      date,
      staffId,
      staffAvailability,
      existingAppointments,
      serviceDuration
    );

    const nextSlot = availableSlots.find(slot => slot.available);
    return nextSlot ? nextSlot.time : null;
  }
}
