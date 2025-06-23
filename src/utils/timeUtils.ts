
import { format, addMinutes, parse } from 'date-fns';

export const timeUtils = {
  /**
   * Calculate end time based on start time and duration
   */
  calculateEndTime: (startTime: string, duration: number): string => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const startDate = new Date();
    startDate.setHours(hours, minutes, 0, 0);
    
    const endDate = addMinutes(startDate, duration);
    return format(endDate, 'HH:mm');
  },

  /**
   * Generate time slots for scheduling
   */
  generateTimeSlots: (
    startHour: number = 8,
    endHour: number = 20,
    intervalMinutes: number = 15
  ): string[] => {
    const slots = [];
    for (let hour = startHour; hour <= endHour; hour++) {
      for (let minute = 0; minute < 60; minute += intervalMinutes) {
        if (hour === endHour && minute > 0) break;
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(time);
      }
    }
    return slots;
  },

  /**
   * Format time for display
   */
  formatTimeForDisplay: (time: string): string => {
    try {
      const parsed = parse(time, 'HH:mm', new Date());
      return format(parsed, 'h:mm a');
    } catch {
      return time;
    }
  },

  /**
   * Check if a time is within business hours
   */
  isWithinBusinessHours: (
    time: string,
    startHour: number = 8,
    endHour: number = 20
  ): boolean => {
    const [hours] = time.split(':').map(Number);
    return hours >= startHour && hours < endHour;
  }
};
