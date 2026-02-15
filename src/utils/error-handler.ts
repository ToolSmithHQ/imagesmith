import { ProcessingError } from '@/src/types/image';

const DEFAULT_MESSAGES: Record<ProcessingError['code'], string> = {
  UNSUPPORTED_FORMAT:
    'This format conversion is not supported on your device.',
  FILE_TOO_LARGE: 'This image is too large to process. Try a smaller image.',
  PERMISSION_DENIED: 'Permission is required to access your photos.',
  PROCESSING_FAILED: 'Failed to convert the image. Please try again.',
  SAVE_FAILED: 'Could not save the image. Check your storage.',
  UNKNOWN: 'Something went wrong. Please try again.',
};

export function createProcessingError(
  code: ProcessingError['code'],
  message: string,
  userMessage?: string,
): ProcessingError {
  return {
    code,
    message,
    userMessage: userMessage ?? DEFAULT_MESSAGES[code],
    recoverable: code !== 'UNSUPPORTED_FORMAT',
  };
}

export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  errorCode: ProcessingError['code'] = 'UNKNOWN',
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error) {
      throw error; // already a ProcessingError
    }
    throw createProcessingError(
      errorCode,
      error instanceof Error ? error.message : 'Unknown error',
    );
  }
}
