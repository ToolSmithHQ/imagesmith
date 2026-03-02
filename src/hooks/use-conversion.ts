import { useCallback } from 'react';
import { NotificationFeedbackType } from 'expo-haptics';
import { useImageStore } from '@/src/stores/use-image-store';
import { convertImage } from '@/src/services/image-processor';
import { ProcessingError } from '@/src/types/image';
import { triggerNotification } from '@/src/utils/haptics';

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
      triggerNotification();
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
      triggerNotification(NotificationFeedbackType.Error);
    }
  }, [
    sourceImage,
    conversionOptions,
    setProcessingState,
    setResult,
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
