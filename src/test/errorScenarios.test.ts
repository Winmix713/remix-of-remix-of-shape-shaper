import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  AppError,
  ValidationError,
  ExportError,
  StorageError,
  ErrorCode,
  toUserMessage,
  createInvalidHexError,
  createInvalidRgbError,
  createPngExportError,
  createSvgExportError,
  createStorageError,
  isStorageAvailable,
} from '@/lib/errors';
import { hexToRgb, rgbToHex } from '@/utils/colorPalette';

describe('Error Classes', () => {
  it('should create AppError with code', () => {
    const error = new AppError('Test error', ErrorCode.E_UNKNOWN);
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AppError);
    expect(error.message).toBe('Test error');
    expect(error.code).toBe(ErrorCode.E_UNKNOWN);
    expect(error.name).toBe('AppError');
  });

  it('should create ValidationError', () => {
    const error = new ValidationError('Invalid input', ErrorCode.E_INVALID_HEX);
    expect(error).toBeInstanceOf(AppError);
    expect(error).toBeInstanceOf(ValidationError);
    expect(error.name).toBe('ValidationError');
  });

  it('should create ExportError', () => {
    const error = new ExportError('Export failed', ErrorCode.E_EXPORT_FAILED);
    expect(error).toBeInstanceOf(AppError);
    expect(error).toBeInstanceOf(ExportError);
    expect(error.name).toBe('ExportError');
  });

  it('should create StorageError', () => {
    const error = new StorageError('Storage failed', ErrorCode.E_STORAGE_FAILED);
    expect(error).toBeInstanceOf(AppError);
    expect(error).toBeInstanceOf(StorageError);
    expect(error.name).toBe('StorageError');
  });

  it('should store original error', () => {
    const originalError = new Error('Original');
    const appError = new AppError('Wrapped', ErrorCode.E_UNKNOWN, originalError);
    expect(appError.originalError).toBe(originalError);
  });

  it('should store context', () => {
    const context = { foo: 'bar', count: 42 };
    const error = new AppError('Test', ErrorCode.E_UNKNOWN, undefined, context);
    expect(error.context).toEqual(context);
  });
});

describe('toUserMessage', () => {
  it('should convert AppError to user message', () => {
    const error = new ValidationError('Technical error', ErrorCode.E_INVALID_HEX);
    const message = toUserMessage(error);
    
    expect(message.message).toBe('Invalid color format');
    expect(message.hint).toBe('Use hex format like #FF0000 or #F00');
  });

  it('should handle standard Error objects', () => {
    const error = new Error('Something went wrong');
    const message = toUserMessage(error);
    
    expect(message.message).toBe('Something went wrong');
    expect(message.hint).toBeDefined();
  });

  it('should handle QuotaExceededError', () => {
    const error = new Error('Quota exceeded');
    error.name = 'QuotaExceededError';
    const message = toUserMessage(error);
    
    expect(message.message).toBe('Storage limit reached');
    expect(message.hint).toBe('Delete old presets to free space');
  });

  it('should handle string errors', () => {
    const message = toUserMessage('String error');
    expect(message.message).toBe('String error');
    expect(message.hint).toBe('Try again');
  });

  it('should handle unknown error types', () => {
    const message = toUserMessage({ weird: 'object' });
    expect(message.message).toBe('Something went wrong');
    expect(message.hint).toBe('Try refreshing the page');
  });

  it('should provide appropriate messages for all error codes', () => {
    const errorCodes = Object.values(ErrorCode);
    
    errorCodes.forEach(code => {
      const error = new AppError('Test', code);
      const message = toUserMessage(error);
      
      expect(message.message).toBeTruthy();
      expect(typeof message.message).toBe('string');
      expect(message.message.length).toBeGreaterThan(0);
    });
  });

  it('should provide hints for all error messages', () => {
    const error = new ValidationError('Test', ErrorCode.E_INVALID_HEX);
    const message = toUserMessage(error);
    
    expect(message.hint).toBeTruthy();
    expect(typeof message.hint).toBe('string');
  });
});

describe('Error Factory Functions', () => {
  it('should create invalid hex error', () => {
    const error = createInvalidHexError('#GG0000');
    expect(error).toBeInstanceOf(ValidationError);
    expect(error.code).toBe(ErrorCode.E_INVALID_HEX);
    expect(error.context?.hex).toBe('#GG0000');
  });

  it('should create invalid RGB error', () => {
    const error = createInvalidRgbError(300, 0, 0);
    expect(error).toBeInstanceOf(ValidationError);
    expect(error.code).toBe(ErrorCode.E_INVALID_RGB);
    expect(error.context?.r).toBe(300);
  });

  it('should create PNG export error', () => {
    const originalError = new Error('Canvas failed');
    const error = createPngExportError(originalError);
    expect(error).toBeInstanceOf(ExportError);
    expect(error.code).toBe(ErrorCode.E_PNG_GENERATION_FAILED);
    expect(error.originalError).toBe(originalError);
  });

  it('should create SVG export error', () => {
    const error = createSvgExportError();
    expect(error).toBeInstanceOf(ExportError);
    expect(error.code).toBe(ErrorCode.E_SVG_GENERATION_FAILED);
  });

  it('should create storage error', () => {
    const error = createStorageError('save');
    expect(error).toBeInstanceOf(StorageError);
    expect(error.code).toBe(ErrorCode.E_STORAGE_FAILED);
    expect(error.context?.operation).toBe('save');
  });

  it('should detect quota exceeded errors', () => {
    const quotaError = new Error('Quota exceeded');
    quotaError.name = 'QuotaExceededError';
    const error = createStorageError('save', quotaError);
    
    expect(error.code).toBe(ErrorCode.E_STORAGE_QUOTA_EXCEEDED);
  });
});

describe('Invalid Hex Color Handling', () => {
  it('should return null for invalid hex in hexToRgb', () => {
    const invalidColors = ['invalid', '#GG0000', '##FF0000', '', '#FFFF'];
    
    invalidColors.forEach(color => {
      const result = hexToRgb(color);
      expect(result).toBeNull();
    });
  });

  it('should throw ValidationError for invalid RGB in rgbToHex', () => {
    expect(() => rgbToHex(256, 0, 0)).toThrow(ValidationError);
    expect(() => rgbToHex(-1, 0, 0)).toThrow(ValidationError);
    expect(() => rgbToHex(0, 300, 0)).toThrow(ValidationError);
  });

  it('should provide helpful error messages for color validation', () => {
    try {
      rgbToHex(300, 0, 0);
      expect.fail('Should have thrown error');
    } catch (error) {
      const message = toUserMessage(error);
      expect(message.message).toContain('RGB');
      expect(message.hint).toBeTruthy();
    }
  });
});

describe('Storage Availability', () => {
  it('should check if localStorage is available', () => {
    const available = isStorageAvailable();
    expect(typeof available).toBe('boolean');
  });

  // Note: These tests run in a jsdom environment where localStorage is available
  it('should return true in test environment', () => {
    expect(isStorageAvailable()).toBe(true);
  });
});

describe('Error Message Format', () => {
  it('should provide concise error messages (max 2 sentences)', () => {
    const errorCodes = Object.values(ErrorCode);
    
    errorCodes.forEach(code => {
      const error = new AppError('Test', code);
      const message = toUserMessage(error);
      
      // Count sentences (rough approximation)
      const sentences = message.message.split(/[.!?]/).filter(s => s.trim().length > 0);
      expect(sentences.length).toBeLessThanOrEqual(2);
    });
  });

  it('should never return undefined or null messages', () => {
    const testErrors = [
      new Error('Test'),
      'string error',
      new AppError('Test', ErrorCode.E_UNKNOWN),
      null,
      undefined,
      { weird: 'object' },
    ];
    
    testErrors.forEach(error => {
      const message = toUserMessage(error);
      expect(message.message).toBeTruthy();
      expect(message.message).not.toBe('undefined');
      expect(message.message).not.toBe('null');
    });
  });

  it('should include recovery action in hints', () => {
    const actionsToCheck = ['try', 'check', 'use', 'delete', 'clear', 'enable', 'refresh'];
    
    const error = new StorageError('Test', ErrorCode.E_STORAGE_QUOTA_EXCEEDED);
    const message = toUserMessage(error);
    
    const hasAction = actionsToCheck.some(action => 
      message.hint?.toLowerCase().includes(action)
    );
    
    expect(hasAction).toBe(true);
  });
});

describe('Error Context and Logging', () => {
  it('should preserve stack trace', () => {
    const error = new AppError('Test', ErrorCode.E_UNKNOWN);
    expect(error.stack).toBeDefined();
    expect(typeof error.stack).toBe('string');
  });

  it('should allow chaining of errors', () => {
    const original = new Error('Original error');
    const wrapped = new AppError('Wrapped error', ErrorCode.E_UNKNOWN, original);
    
    expect(wrapped.originalError).toBe(original);
    expect(wrapped.message).toBe('Wrapped error');
  });

  it('should store multiple context values', () => {
    const context = {
      userId: 123,
      action: 'export',
      format: 'png',
      timestamp: Date.now(),
    };
    
    const error = new AppError('Test', ErrorCode.E_EXPORT_FAILED, undefined, context);
    expect(error.context).toEqual(context);
  });
});

describe('PNG Export Error Scenarios', () => {
  it('should create appropriate error for canvas failure', () => {
    const canvasError = new Error('Canvas not supported');
    const error = createPngExportError(canvasError);
    const message = toUserMessage(error);
    
    expect(message.message).toContain('PNG');
    expect(message.hint).toBeTruthy();
  });

  it('should provide SVG alternative hint for PNG failures', () => {
    const error = createPngExportError();
    const message = toUserMessage(error);
    
    expect(message.hint?.toLowerCase()).toContain('svg');
  });
});

describe('LocalStorage Error Scenarios', () => {
  it('should handle quota exceeded gracefully', () => {
    const quotaError = new Error('Storage quota exceeded');
    quotaError.name = 'QuotaExceededError';
    const error = createStorageError('save', quotaError);
    const message = toUserMessage(error);
    
    expect(message.message).toBe('Storage limit reached');
    expect(message.hint).toContain('Delete');
  });

  it('should provide fallback guidance for unavailable storage', () => {
    const error = new StorageError('Test', ErrorCode.E_STORAGE_NOT_AVAILABLE);
    const message = toUserMessage(error);
    
    expect(message.message).toContain('not available');
    expect(message.hint).toBeTruthy();
  });
});
