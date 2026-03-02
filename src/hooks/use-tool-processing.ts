import { useCallback } from 'react';
import { NotificationFeedbackType } from 'expo-haptics';
import { useImageStore } from '@/src/stores/use-image-store';
import { useSettingsStore } from '@/src/stores/use-settings-store';
import { convertImage } from '@/src/services/image-processor';
import { cropRotateFlipImage } from '@/src/services/crop-processor';
import { resizeImage } from '@/src/services/resize-processor';
import { compressImage } from '@/src/services/compress-processor';
import { stripMetadata } from '@/src/services/metadata-processor';
import { ProcessingError } from '@/src/types/image';
import { triggerNotification } from '@/src/utils/haptics';

export function useToolProcessing() {
  const {
    sourceImage,
    activeTool,
    conversionOptions,
    cropOptions,
    resizeOptions,
    compressOptions,
    processingState,
    currentResult,
    setProcessingState,
    setResult,
    reset,
  } = useImageStore();

  const { reEncodingQuality } = useSettingsStore();

  const startProcessing = useCallback(async () => {
    if (!sourceImage) return;

    setProcessingState({ status: 'processing', progress: 0, error: undefined });
    const onProgress = (progress: number) => setProcessingState({ progress });

    try {
      let result;

      switch (activeTool) {
        case 'convert':
          result = await convertImage(sourceImage, conversionOptions, onProgress);
          break;
        case 'crop':
          result = await cropRotateFlipImage(sourceImage, cropOptions, onProgress, reEncodingQuality);
          break;
        case 'resize':
          result = await resizeImage(sourceImage, resizeOptions, onProgress, reEncodingQuality);
          break;
        case 'compress':
          result = await compressImage(sourceImage, compressOptions, onProgress);
          break;
        case 'metadata':
          result = await stripMetadata(sourceImage, onProgress);
          break;
        default:
          throw {
            code: 'UNKNOWN' as const,
            message: 'Unknown tool',
            userMessage: 'Unknown tool type.',
            recoverable: false,
          };
      }

      setResult(result);
      triggerNotification();
    } catch (error) {
      const processingError: ProcessingError =
        error && typeof error === 'object' && 'code' in error
          ? (error as ProcessingError)
          : {
              code: 'UNKNOWN',
              message: error instanceof Error ? error.message : 'Unknown error',
              userMessage: 'Something went wrong. Please try again.',
              recoverable: true,
            };

      setProcessingState({ status: 'error', error: processingError });
      triggerNotification(NotificationFeedbackType.Error);
    }
  }, [
    sourceImage,
    activeTool,
    conversionOptions,
    cropOptions,
    resizeOptions,
    compressOptions,
    reEncodingQuality,
    setProcessingState,
    setResult,
  ]);

  const retry = useCallback(() => {
    startProcessing();
  }, [startProcessing]);

  return {
    sourceImage,
    activeTool,
    processingState,
    currentResult,
    startProcessing,
    retry,
    reset,
  };
}
