import { createProcessingError } from '@/src/utils/error-handler';

describe('createProcessingError', () => {
  it('creates error with correct code and message', () => {
    const error = createProcessingError('PROCESSING_FAILED', 'Something broke');
    expect(error.code).toBe('PROCESSING_FAILED');
    expect(error.message).toBe('Something broke');
  });

  it('uses default userMessage when not provided', () => {
    const error = createProcessingError('UNSUPPORTED_FORMAT', 'internal msg');
    expect(error.userMessage).toBe(
      'This format conversion is not supported on your device.',
    );
  });

  it('uses custom userMessage when provided', () => {
    const error = createProcessingError(
      'PROCESSING_FAILED',
      'internal',
      'Custom user message',
    );
    expect(error.userMessage).toBe('Custom user message');
  });

  it('sets recoverable to false for UNSUPPORTED_FORMAT', () => {
    const error = createProcessingError('UNSUPPORTED_FORMAT', 'msg');
    expect(error.recoverable).toBe(false);
  });

  it('sets recoverable to true for all other error codes', () => {
    const recoverableCodes = [
      'FILE_TOO_LARGE',
      'PERMISSION_DENIED',
      'PROCESSING_FAILED',
      'SAVE_FAILED',
      'METADATA_READ_FAILED',
      'UNKNOWN',
    ] as const;

    for (const code of recoverableCodes) {
      const error = createProcessingError(code, 'msg');
      expect(error.recoverable).toBe(true);
    }
  });

  it('has default messages for all error codes', () => {
    const codes = [
      'UNSUPPORTED_FORMAT',
      'FILE_TOO_LARGE',
      'PERMISSION_DENIED',
      'PROCESSING_FAILED',
      'SAVE_FAILED',
      'METADATA_READ_FAILED',
      'UNKNOWN',
    ] as const;

    for (const code of codes) {
      const error = createProcessingError(code, 'test');
      expect(error.userMessage).toBeTruthy();
      expect(typeof error.userMessage).toBe('string');
      expect(error.userMessage.length).toBeGreaterThan(0);
    }
  });
});
