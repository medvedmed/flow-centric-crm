
export enum ErrorType {
  VALIDATION = 'VALIDATION',
  NETWORK = 'NETWORK',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  SERVER_ERROR = 'SERVER_ERROR',
  UNKNOWN = 'UNKNOWN'
}

export interface AppError {
  type: ErrorType;
  message: string;
  code?: string;
  details?: any;
  timestamp: Date;
}

export class ErrorHandler {
  static createError(type: ErrorType, message: string, code?: string, details?: any): AppError {
    return {
      type,
      message,
      code,
      details,
      timestamp: new Date()
    };
  }

  static handleApiError(error: any): AppError {
    console.error('API Error:', error);

    // Handle Supabase errors
    if (error?.code) {
      switch (error.code) {
        case '23505': // Unique constraint violation
          return this.createError(
            ErrorType.CONFLICT,
            'This record already exists',
            'DUPLICATE_RECORD',
            error
          );
        case '23503': // Foreign key violation
          return this.createError(
            ErrorType.VALIDATION,
            'Referenced record does not exist',
            'INVALID_REFERENCE',
            error
          );
        case 'PGRST116': // No rows returned
          return this.createError(
            ErrorType.NOT_FOUND,
            'Record not found',
            'NOT_FOUND',
            error
          );
        default:
          return this.createError(
            ErrorType.SERVER_ERROR,
            error.message || 'Database operation failed',
            error.code,
            error
          );
      }
    }

    // Handle network errors
    if (error?.name === 'NetworkError' || error?.message?.includes('fetch')) {
      return this.createError(
        ErrorType.NETWORK,
        'Network connection failed. Please check your internet connection.',
        'NETWORK_ERROR',
        error
      );
    }

    // Handle authentication errors
    if (error?.status === 401 || error?.message?.includes('auth')) {
      return this.createError(
        ErrorType.AUTHENTICATION,
        'Authentication required. Please log in again.',
        'AUTH_REQUIRED',
        error
      );
    }

    // Handle authorization errors
    if (error?.status === 403) {
      return this.createError(
        ErrorType.AUTHORIZATION,
        'You do not have permission to perform this action.',
        'INSUFFICIENT_PERMISSIONS',
        error
      );
    }

    // Handle not found errors
    if (error?.status === 404) {
      return this.createError(
        ErrorType.NOT_FOUND,
        'The requested resource was not found.',
        'RESOURCE_NOT_FOUND',
        error
      );
    }

    // Generic server errors
    if (error?.status >= 500) {
      return this.createError(
        ErrorType.SERVER_ERROR,
        'Server error occurred. Please try again later.',
        'SERVER_ERROR',
        error
      );
    }

    // Unknown errors
    return this.createError(
      ErrorType.UNKNOWN,
      error?.message || 'An unexpected error occurred',
      'UNKNOWN_ERROR',
      error
    );
  }

  static getErrorMessage(error: AppError): string {
    const baseMessage = error.message;
    
    switch (error.type) {
      case ErrorType.VALIDATION:
        return `Validation Error: ${baseMessage}`;
      case ErrorType.NETWORK:
        return `Connection Error: ${baseMessage}`;
      case ErrorType.AUTHENTICATION:
        return `Authentication Error: ${baseMessage}`;
      case ErrorType.AUTHORIZATION:
        return `Permission Error: ${baseMessage}`;
      case ErrorType.NOT_FOUND:
        return `Not Found: ${baseMessage}`;
      case ErrorType.CONFLICT:
        return `Conflict: ${baseMessage}`;
      case ErrorType.SERVER_ERROR:
        return `Server Error: ${baseMessage}`;
      default:
        return baseMessage;
    }
  }

  static getErrorSeverity(error: AppError): 'low' | 'medium' | 'high' | 'critical' {
    switch (error.type) {
      case ErrorType.VALIDATION:
        return 'low';
      case ErrorType.NOT_FOUND:
        return 'medium';
      case ErrorType.NETWORK:
      case ErrorType.CONFLICT:
        return 'medium';
      case ErrorType.AUTHENTICATION:
      case ErrorType.AUTHORIZATION:
        return 'high';
      case ErrorType.SERVER_ERROR:
      case ErrorType.UNKNOWN:
        return 'critical';
      default:
        return 'medium';
    }
  }

  static shouldRetry(error: AppError): boolean {
    return [ErrorType.NETWORK, ErrorType.SERVER_ERROR].includes(error.type);
  }

  static logError(error: AppError, context?: string): void {
    const severity = this.getErrorSeverity(error);
    const message = `[${error.type}] ${this.getErrorMessage(error)}`;
    
    if (context) {
      console.group(`Error in ${context}`);
    }
    
    switch (severity) {
      case 'critical':
        console.error(message, error.details);
        break;
      case 'high':
        console.error(message, error.details);
        break;
      case 'medium':
        console.warn(message, error.details);
        break;
      case 'low':
        console.info(message, error.details);
        break;
    }
    
    if (context) {
      console.groupEnd();
    }
  }
}
