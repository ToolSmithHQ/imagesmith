import { useCallback } from 'react';
import { useImageStore } from '@/src/stores/use-image-store';
import { useHistoryStore } from '@/src/stores/use-history-store';
import { convertImage } from '@/src/services/image-processor';
import { ProcessingError } from '@/src/types/image';

export function useConversion() {
  const {
    sourceImage,
    conversionOptions,
    processingState,
    currentResult,
    setProcessingState,
    setResult,
    reset,
  } = useImageStore();

  const { addConversion } = useHistoryStore();

  const startConversion = useCallback(async () => {
    if (!sourceImage) return;

    setProcessingState({ status: 'processing', progress: 0, error: undefined });

    try {
      const result = await convertImage(
        sourceImage,
        conversionOptions,
        (progress) => setProcessingState({ progress }),
      );

      setResult(result);
      addConversion(result);
    } catch (error) {
      const processingError: ProcessingError =
        error && typeof error === 'object' && 'code' in error
          ? (error as ProcessingError)
          : {
              code: 'UNKNOWN',
              message:
                error instanceof Error ? error.message : 'Unknown error',
              userMessage: 'Something went wrong. Please try again.',
              recoverable: true,
            };

      setProcessingState({
        status: 'error',
        error: processingError,
      });
    }
  }, [
    sourceImage,
    conversionOptions,
    setProcessingState,
    setResult,
    addConversion,
  ]);

  const retry = useCallback(() => {
    startConversion();
  }, [startConversion]);

  return {
    sourceImage,
    conversionOptions,
    processingState,
    currentResult,
    startConversion,
    retry,
    reset,
  };
}
