
import { format, parse, isBefore, isAfter, isSameDay } from 'date-fns';
import { timeUtils } from '@/utils/timeUtils';

export interface AppointmentData {
  clientId?: string;
  clientName: string;
  clientPhone?: string;
  staffId: string;
  service: string;
  date: Date;
  startTime: string;
  duration: number;
  price: number;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: string[];
}

export class AppointmentValidator {
  static validateAppointment(data: AppointmentData): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: string[] = [];

    // Required field validation
    if (!data.clientName.trim()) {
      errors.push({
        field: 'clientName',
        message: 'Client name is required',
        code: 'REQUIRED_FIELD'
      });
    }

    if (!data.staffId) {
      errors.push({
        field: 'staffId',
        message: 'Staff member selection is required',
        code: 'REQUIRED_FIELD'
      });
    }

    if (!data.service) {
      errors.push({
        field: 'service',
        message: 'Service selection is required',
        code: 'REQUIRED_FIELD'
      });
    }

    if (!data.startTime) {
      errors.push({
        field: 'startTime',
        message: 'Start time is required',
        code: 'REQUIRED_FIELD'
      });
    }

    // Date validation
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (isBefore(data.date, today)) {
      errors.push({
        field: 'date',
        message: 'Appointment date cannot be in the past',
        code: 'PAST_DATE'
      });
    }

    // Time validation
    if (data.startTime) {
      if (!timeUtils.isWithinBusinessHours(data.startTime)) {
        warnings.push('Selected time is outside normal business hours');
      }

      // Check if appointment is too soon (less than 1 hour from now)
      if (isSameDay(data.date, new Date())) {
        const now = new Date();
        const appointmentTime = parse(data.startTime, 'HH:mm', data.date);
        const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
        
        if (isBefore(appointmentTime, oneHourFromNow)) {
          warnings.push('Appointment is scheduled less than 1 hour from now');
        }
      }
    }

    // Duration validation
    if (data.duration < 15) {
      errors.push({
        field: 'duration',
        message: 'Appointment duration must be at least 15 minutes',
        code: 'INVALID_DURATION'
      });
    }

    if (data.duration > 480) { // 8 hours
      warnings.push('Appointment duration is unusually long (over 8 hours)');
    }

    // Price validation
    if (data.price < 0) {
      errors.push({
        field: 'price',
        message: 'Price cannot be negative',
        code: 'INVALID_PRICE'
      });
    }

    if (data.price > 1000) {
      warnings.push('Price is unusually high (over $1000)');
    }

    // Client validation
    if (data.clientPhone && !this.isValidPhoneNumber(data.clientPhone)) {
      errors.push({
        field: 'clientPhone',
        message: 'Please enter a valid phone number',
        code: 'INVALID_PHONE'
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  static isValidPhoneNumber(phone: string): boolean {
    // Basic phone validation - can be enhanced based on requirements
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    const cleanPhone = phone.replace(/[\s\-\(\)\.]/g, '');
    return phoneRegex.test(cleanPhone) && cleanPhone.length >= 10;
  }

  static validateTimeSlot(startTime: string, duration: number, existingAppointments: any[] = []): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: string[] = [];

    const endTime = timeUtils.calculateEndTime(startTime, duration);
    
    // Check for overlapping appointments
    const hasConflict = existingAppointments.some(apt => {
      const aptStart = apt.startTime;
      const aptEnd = apt.endTime;
      
      return (
        (startTime >= aptStart && startTime < aptEnd) ||
        (endTime > aptStart && endTime <= aptEnd) ||
        (startTime <= aptStart && endTime >= aptEnd)
      );
    });

    if (hasConflict) {
      errors.push({
        field: 'startTime',
        message: 'This time slot conflicts with an existing appointment',
        code: 'TIME_CONFLICT'
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}
