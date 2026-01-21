// ============================================================================
// ERROR HANDLING FRAMEWORK
// ============================================================================

/**
 * Error codes for categorizing errors
 */
export enum ErrorCode {
  // Validation errors
  E_INVALID_HEX = 'E_INVALID_HEX',
  E_INVALID_RGB = 'E_INVALID_RGB',
  E_INVALID_DIMENSIONS = 'E_INVALID_DIMENSIONS',
  E_INVALID_EXPONENT = 'E_INVALID_EXPONENT',
  E_INVALID_GRADIENT = 'E_INVALID_GRADIENT',
  
  // Export errors
  E_EXPORT_FAILED = 'E_EXPORT_FAILED',
  E_SVG_GENERATION_FAILED = 'E_SVG_GENERATION_FAILED',
  E_PNG_GENERATION_FAILED = 'E_PNG_GENERATION_FAILED',
  E_CANVAS_NOT_SUPPORTED = 'E_CANVAS_NOT_SUPPORTED',
  E_BLOB_CREATION_FAILED = 'E_BLOB_CREATION_FAILED',
  
  // Storage errors
  E_STORAGE_FAILED = 'E_STORAGE_FAILED',
  E_STORAGE_QUOTA_EXCEEDED = 'E_STORAGE_QUOTA_EXCEEDED',
  E_STORAGE_NOT_AVAILABLE = 'E_STORAGE_NOT_AVAILABLE',
  E_INVALID_PRESET_DATA = 'E_INVALID_PRESET_DATA',
  
  // General errors
  E_UNKNOWN = 'E_UNKNOWN',
  E_NETWORK_ERROR = 'E_NETWORK_ERROR',
}

/**
 * Base application error class
 */
export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly originalError?: Error;
  public readonly context?: Record<string, unknown>;

  constructor(
    message: string,
    code: ErrorCode = ErrorCode.E_UNKNOWN,
    originalError?: Error,
    context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.originalError = originalError;
    this.context = context;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }
}

/**
 * Validation error for input validation failures
 */
export class ValidationError extends AppError {
  constructor(
    message: string,
    code: ErrorCode = ErrorCode.E_UNKNOWN,
    originalError?: Error,
    context?: Record<string, unknown>
  ) {
    super(message, code, originalError, context);
    this.name = 'ValidationError';
  }
}

/**
 * Export error for file export failures
 */
export class ExportError extends AppError {
  constructor(
    message: string,
    code: ErrorCode = ErrorCode.E_EXPORT_FAILED,
    originalError?: Error,
    context?: Record<string, unknown>
  ) {
    super(message, code, originalError, context);
    this.name = 'ExportError';
  }
}

/**
 * Storage error for localStorage/storage failures
 */
export class StorageError extends AppError {
  constructor(
    message: string,
    code: ErrorCode = ErrorCode.E_STORAGE_FAILED,
    originalError?: Error,
    context?: Record<string, unknown>
  ) {
    super(message, code, originalError, context);
    this.name = 'StorageError';
  }
}

// ============================================================================
// USER MESSAGE CONVERSION
// ============================================================================

/**
 * Convert error codes to user-friendly messages with recovery hints
 */
const ERROR_MESSAGES: Record<ErrorCode, { message: string; hint?: string }> = {
  // Validation errors
  [ErrorCode.E_INVALID_HEX]: {
    message: 'Invalid color format',
    hint: 'Use hex format like #FF0000 or #F00',
  },
  [ErrorCode.E_INVALID_RGB]: {
    message: 'RGB values must be between 0 and 255',
    hint: 'Check your color values',
  },
  [ErrorCode.E_INVALID_DIMENSIONS]: {
    message: 'Width and height must be positive numbers',
    hint: 'Try values between 50 and 2000',
  },
  [ErrorCode.E_INVALID_EXPONENT]: {
    message: 'Exponent must be a positive number',
    hint: 'Try values between 0.5 and 20',
  },
  [ErrorCode.E_INVALID_GRADIENT]: {
    message: 'Invalid gradient configuration',
    hint: 'Check your gradient stops and positions',
  },

  // Export errors
  [ErrorCode.E_EXPORT_FAILED]: {
    message: 'Export failed',
    hint: 'Try again or use a different format',
  },
  [ErrorCode.E_SVG_GENERATION_FAILED]: {
    message: 'SVG generation failed',
    hint: 'Check your shape settings and try again',
  },
  [ErrorCode.E_PNG_GENERATION_FAILED]: {
    message: 'PNG export failed',
    hint: 'Try SVG format instead or reduce dimensions',
  },
  [ErrorCode.E_CANVAS_NOT_SUPPORTED]: {
    message: 'Your browser doesn\'t support canvas',
    hint: 'Use SVG export instead',
  },
  [ErrorCode.E_BLOB_CREATION_FAILED]: {
    message: 'Failed to create download file',
    hint: 'Try again or clear browser cache',
  },

  // Storage errors
  [ErrorCode.E_STORAGE_FAILED]: {
    message: 'Failed to save preset',
    hint: 'Check if cookies are enabled',
  },
  [ErrorCode.E_STORAGE_QUOTA_EXCEEDED]: {
    message: 'Storage limit reached',
    hint: 'Delete old presets to free space',
  },
  [ErrorCode.E_STORAGE_NOT_AVAILABLE]: {
    message: 'Storage is not available',
    hint: 'Enable cookies or use private browsing',
  },
  [ErrorCode.E_INVALID_PRESET_DATA]: {
    message: 'Invalid preset data',
    hint: 'Check your JSON format',
  },

  // General errors
  [ErrorCode.E_UNKNOWN]: {
    message: 'Something went wrong',
    hint: 'Try refreshing the page',
  },
  [ErrorCode.E_NETWORK_ERROR]: {
    message: 'Network error occurred',
    hint: 'Check your connection',
  },
};

/**
 * Convert any error to a user-friendly message
 * @param error - Error object (can be any type)
 * @returns User-friendly error message with optional hint
 */
export function toUserMessage(error: unknown): { message: string; hint?: string } {
  // Handle AppError and its subclasses
  if (error instanceof AppError) {
    const errorInfo = ERROR_MESSAGES[error.code];
    return errorInfo || ERROR_MESSAGES[ErrorCode.E_UNKNOWN];
  }

  // Handle standard Error objects
  if (error instanceof Error) {
    // Check for quota exceeded errors
    if (error.name === 'QuotaExceededError') {
      return ERROR_MESSAGES[ErrorCode.E_STORAGE_QUOTA_EXCEEDED];
    }

    // Generic error handling
    return {
      message: error.message || 'An error occurred',
      hint: 'Try again or refresh the page',
    };
  }

  // Handle string errors
  if (typeof error === 'string') {
    return {
      message: error,
      hint: 'Try again',
    };
  }

  // Fallback for unknown error types
  return ERROR_MESSAGES[ErrorCode.E_UNKNOWN];
}

// ============================================================================
// ERROR LOGGING
// ============================================================================

/**
 * Log error with appropriate detail level based on environment
 * @param error - Error to log
 * @param context - Additional context information
 */
export function logError(error: unknown, context?: Record<string, unknown>): void {
  const isDevelopment = import.meta.env.DEV;

  if (isDevelopment) {
    // In development, log full error details to console
    console.group('🔴 Error Details');
    console.error('Error:', error);
    
    if (error instanceof AppError) {
      console.log('Code:', error.code);
      console.log('Context:', error.context);
      if (error.originalError) {
        console.log('Original Error:', error.originalError);
      }
    }
    
    if (context) {
      console.log('Additional Context:', context);
    }
    
    console.groupEnd();
  } else {
    // In production, you would send to monitoring service
    // For now, just log minimal info
    console.error('Error occurred:', error instanceof Error ? error.message : 'Unknown error');
    
    // Example: Send to monitoring service
    // sendToMonitoring({
    //   error: error instanceof Error ? error.message : String(error),
    //   code: error instanceof AppError ? error.code : ErrorCode.E_UNKNOWN,
    //   context,
    //   timestamp: new Date().toISOString(),
    // });
  }
}

// ============================================================================
// ERROR FACTORY FUNCTIONS
// ============================================================================

/**
 * Create a validation error for invalid hex color
 */
export function createInvalidHexError(hex: string): ValidationError {
  return new ValidationError(
    `Invalid hex color: ${hex}`,
    ErrorCode.E_INVALID_HEX,
    undefined,
    { hex }
  );
}

/**
 * Create a validation error for invalid RGB values
 */
export function createInvalidRgbError(r: number, g: number, b: number): ValidationError {
  return new ValidationError(
    `Invalid RGB values: (${r}, ${g}, ${b})`,
    ErrorCode.E_INVALID_RGB,
    undefined,
    { r, g, b }
  );
}

/**
 * Create an export error for PNG generation failure
 */
export function createPngExportError(originalError?: Error): ExportError {
  return new ExportError(
    'Failed to export PNG',
    ErrorCode.E_PNG_GENERATION_FAILED,
    originalError
  );
}

/**
 * Create an export error for SVG generation failure
 */
export function createSvgExportError(originalError?: Error): ExportError {
  return new ExportError(
    'Failed to export SVG',
    ErrorCode.E_SVG_GENERATION_FAILED,
    originalError
  );
}

/**
 * Create a storage error for localStorage failures
 */
export function createStorageError(operation: string, originalError?: Error): StorageError {
  // Check if it's a quota exceeded error
  if (originalError?.name === 'QuotaExceededError') {
    return new StorageError(
      'Storage quota exceeded',
      ErrorCode.E_STORAGE_QUOTA_EXCEEDED,
      originalError,
      { operation }
    );
  }

  return new StorageError(
    `Storage operation failed: ${operation}`,
    ErrorCode.E_STORAGE_FAILED,
    originalError,
    { operation }
  );
}

/**
 * Check if localStorage is available
 */
export function isStorageAvailable(): boolean {
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}
