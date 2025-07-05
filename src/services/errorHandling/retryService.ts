interface RetryOptions {
  maxAttempts?: number;
  delay?: number;
  backoffMultiplier?: number;
  shouldRetry?: (error: any) => boolean;
  onRetry?: (attempt: number, error: any) => void;
}

export class RetryService {
  static async withRetry<T>(
    operation: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<T> {
    const {
      maxAttempts = 3,
      delay = 1000,
      backoffMultiplier = 2,
      shouldRetry = (error) => this.isRetryableError(error),
      onRetry,
    } = options;

    let lastError: any;
    let currentDelay = delay;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        if (attempt === maxAttempts || !shouldRetry(error)) {
          throw error;
        }

        onRetry?.(attempt, error);
        
        await this.sleep(currentDelay);
        currentDelay *= backoffMultiplier;
      }
    }

    throw lastError;
  }

  private static isRetryableError(error: any): boolean {
    // Network errors, timeouts, rate limits, server errors
    if (!error) return false;
    
    const message = error.message?.toLowerCase() || '';
    const code = error.code;
    
    // Supabase/PostgreSQL specific retryable errors
    const retryableCodes = [
      'PGRST301', // Connection lost
      'PGRST302', // Connection timeout
      '23505',    // Unique constraint (sometimes transient)
      '40001',    // Serialization failure
      '40P01',    // Deadlock detected
    ];

    if (code && retryableCodes.includes(code)) return true;
    
    // Network/HTTP errors
    const retryableMessages = [
      'network error',
      'timeout',
      'connection refused',
      'connection reset',
      'rate limit',
      'too many requests',
      'server error',
      'service unavailable',
      'gateway timeout',
    ];

    return retryableMessages.some(msg => message.includes(msg));
  }

  private static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Exponential backoff with jitter for better distribution
  static exponentialBackoffWithJitter(baseDelay: number, attempt: number): number {
    const exponentialDelay = baseDelay * Math.pow(2, attempt - 1);
    const jitter = Math.random() * 0.1 * exponentialDelay;
    return Math.min(exponentialDelay + jitter, 30000); // Cap at 30 seconds
  }
}