import * as ImageManipulator from 'expo-image-manipulator';
import { ImageAsset, ResizeOptions, ToolResult } from '@/src/types/image';
import { ImageFormat } from '@/src/types/formats';
import { createProcessingError } from '@/src/utils/error-handler';
import { ensureCacheDir, generateId, getFileSize } from '@/src/services/file-manager';

export async function resizeImage(
  source: ImageAsset,
  options: ResizeOptions,
  onProgress?: (progress: number) => void,
  reEncodingQuality: number = 0.95,
): Promise<ToolResult> {
  const startTime = Date.now();
  ensureCacheDir();
  onProgress?.(0.1);

  if (options.width <= 0 || options.height <= 0) {
    throw createProcessingError(
      'PROCESSING_FAILED',
      'Invalid dimensions',
      'Width and height must be greater than zero.',
    );
  }

  onProgress?.(0.3);

  try {
    const isLossless =
      source.format === ImageFormat.PNG ||
      source.format === ImageFormat.BMP ||
      source.format === ImageFormat.TIFF;

    const saveOptions: ImageManipulator.SaveOptions = isLossless
      ? { format: ImageManipulator.SaveFormat.PNG }
      : { format: ImageManipulator.SaveFormat.JPEG, compress: reEncodingQuality };

    const result = await ImageManipulator.manipulateAsync(
      source.uri,
      [{ resize: { width: options.width, height: options.height } }],
      saveOptions,
    );

    onProgress?.(0.8);

    const fileSize = getFileSize(result.uri);
    const output: ImageAsset = {
      uri: result.uri,
      fileName: result.uri.split('/').pop() ?? 'resized.png',
      format: source.format,
      width: result.width,
      height: result.height,
      fileSize,
      mimeType: source.mimeType,
    };

    onProgress?.(1.0);

    return {
      id: generateId(),
      tool: 'resize',
      source,
      output,
      options: { tool: 'resize', config: options },
      processingTimeMs: Date.now() - startTime,
      timestamp: Date.now(),
    };
  } catch (error) {
    throw createProcessingError(
      'PROCESSING_FAILED',
      error instanceof Error ? error.message : 'Resize failed',
    );
  }
}
