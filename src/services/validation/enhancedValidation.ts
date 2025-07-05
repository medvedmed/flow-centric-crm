import { toast } from '@/hooks/use-toast';

export interface ValidationRule<T = any> {
  field: keyof T;
  required?: boolean;
  type?: 'string' | 'number' | 'email' | 'phone' | 'date' | 'time';
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: any, data: T) => string | null;
  message?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string[]>;
  warnings: Record<string, string[]>;
}

export class EnhancedValidator {
  static validate<T extends Record<string, any>>(
    data: T,
    rules: ValidationRule<T>[]
  ): ValidationResult {
    const errors: Record<string, string[]> = {};
    const warnings: Record<string, string[]> = {};

    for (const rule of rules) {
      const fieldName = String(rule.field);
      const value = data[rule.field];
      const fieldErrors: string[] = [];
      const fieldWarnings: string[] = [];

      // Required validation
      if (rule.required && this.isEmpty(value)) {
        fieldErrors.push(rule.message || `${fieldName} is required`);
        continue;
      }

      // Skip other validations if field is empty and not required
      if (this.isEmpty(value) && !rule.required) {
        continue;
      }

      // Type validation
      if (rule.type) {
        const typeError = this.validateType(value, rule.type, fieldName);
        if (typeError) {
          fieldErrors.push(typeError);
          continue;
        }
      }

      // Length validation for strings
      if (typeof value === 'string') {
        if (rule.minLength && value.length < rule.minLength) {
          fieldErrors.push(`${fieldName} must be at least ${rule.minLength} characters long`);
        }
        if (rule.maxLength && value.length > rule.maxLength) {
          fieldErrors.push(`${fieldName} must be no more than ${rule.maxLength} characters long`);
        }
      }

      // Numeric validation
      if (typeof value === 'number') {
        if (rule.min !== undefined && value < rule.min) {
          fieldErrors.push(`${fieldName} must be at least ${rule.min}`);
        }
        if (rule.max !== undefined && value > rule.max) {
          fieldErrors.push(`${fieldName} must be no more than ${rule.max}`);
        }
      }

      // Pattern validation
      if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
        fieldErrors.push(rule.message || `${fieldName} format is invalid`);
      }

      // Custom validation
      if (rule.custom) {
        const customError = rule.custom(value, data);
        if (customError) {
          fieldErrors.push(customError);
        }
      }

      // Add warnings for edge cases
      this.addWarnings(value, rule, fieldWarnings, fieldName);

      if (fieldErrors.length > 0) {
        errors[fieldName] = fieldErrors;
      }
      if (fieldWarnings.length > 0) {
        warnings[fieldName] = fieldWarnings;
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      warnings,
    };
  }

  private static isEmpty(value: any): boolean {
    return value === null || value === undefined || value === '' || 
           (Array.isArray(value) && value.length === 0);
  }

  private static validateType(value: any, type: string, fieldName: string): string | null {
    switch (type) {
      case 'string':
        return typeof value !== 'string' ? `${fieldName} must be a string` : null;
      
      case 'number':
        return typeof value !== 'number' || isNaN(value) ? `${fieldName} must be a valid number` : null;
      
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return !emailRegex.test(String(value)) ? `${fieldName} must be a valid email address` : null;
      
      case 'phone':
        // Enhanced phone validation - international support
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        const cleanPhone = String(value).replace(/[\s\-\(\)\.]/g, '');
        return !phoneRegex.test(cleanPhone) ? `${fieldName} must be a valid phone number` : null;
      
      case 'date':
        const date = new Date(value);
        return isNaN(date.getTime()) ? `${fieldName} must be a valid date` : null;
      
      case 'time':
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        return !timeRegex.test(String(value)) ? `${fieldName} must be a valid time (HH:MM)` : null;
      
      default:
        return null;
    }
  }

  private static addWarnings(value: any, rule: ValidationRule, warnings: string[], fieldName: string): void {
    // Add business logic warnings
    if (rule.type === 'phone' && typeof value === 'string') {
      const cleanPhone = value.replace(/\D/g, '');
      if (cleanPhone.length < 10) {
        warnings.push(`${fieldName} appears to be too short for a valid phone number`);
      }
    }

    if (rule.type === 'number' && typeof value === 'number') {
      if (fieldName.toLowerCase().includes('price') && value > 500) {
        warnings.push(`${fieldName} seems unusually high`);
      }
      if (fieldName.toLowerCase().includes('duration') && value > 300) {
        warnings.push(`${fieldName} is longer than typical (5+ hours)`);
      }
    }

    if (rule.type === 'date') {
      const date = new Date(value);
      const today = new Date();
      const futureLimit = new Date();
      futureLimit.setFullYear(today.getFullYear() + 1);
      
      if (date > futureLimit) {
        warnings.push(`${fieldName} is more than a year in the future`);
      }
    }
  }

  // Helper for real-time validation with debouncing
  static createDebouncedValidator<T extends Record<string, any>>(
    rules: ValidationRule<T>[],
    onValidation: (result: ValidationResult) => void,
    delay: number = 500
  ) {
    let timeoutId: NodeJS.Timeout;

    return (data: T) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const result = this.validate(data, rules);
        onValidation(result);
      }, delay);
    };
  }

  // Display validation errors as toast notifications
  static showValidationErrors(result: ValidationResult, prefix: string = ''): void {
    if (!result.isValid) {
      const errorMessages = Object.entries(result.errors)
        .flatMap(([field, errors]) => errors.map(error => `${field}: ${error}`))
        .slice(0, 3); // Limit to 3 errors to avoid spam

      toast({
        title: `${prefix}Validation Error`,
        description: errorMessages.join('\n'),
        variant: 'destructive',
      });
    }

    // Show warnings as informational toasts
    const warningMessages = Object.entries(result.warnings)
      .flatMap(([field, warnings]) => warnings)
      .slice(0, 2);

    if (warningMessages.length > 0) {
      toast({
        title: 'Note',
        description: warningMessages.join('\n'),
        variant: 'default',
      });
    }
  }
}

// Pre-defined validation rule sets for common entities
export const AppointmentValidationRules: ValidationRule[] = [
  { field: 'clientName', required: true, type: 'string', minLength: 2, maxLength: 100 },
  { field: 'clientPhone', type: 'phone', maxLength: 20 },
  { field: 'service', required: true, type: 'string', minLength: 1 },
  { field: 'date', required: true, type: 'date' },
  { field: 'startTime', required: true, type: 'time' },
  { field: 'duration', required: true, type: 'number', min: 15, max: 480 },
  { field: 'price', required: true, type: 'number', min: 0, max: 2000 },
];

export const ClientValidationRules: ValidationRule[] = [
  { field: 'name', required: true, type: 'string', minLength: 2, maxLength: 100 },
  { field: 'email', required: true, type: 'email', maxLength: 255 },
  { field: 'phone', type: 'phone', maxLength: 20 },
  { field: 'notes', type: 'string', maxLength: 1000 },
];

export const StaffValidationRules: ValidationRule[] = [
  { field: 'name', required: true, type: 'string', minLength: 2, maxLength: 100 },
  { field: 'email', required: true, type: 'email', maxLength: 255 },
  { field: 'phone', type: 'phone', maxLength: 20 },
  { field: 'hourlyRate', type: 'number', min: 0, max: 200 },
  { field: 'commissionRate', type: 'number', min: 0, max: 100 },
];