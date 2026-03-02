import * as ImageManipulator from 'expo-image-manipulator';
import { ImageAsset, CropOptions, ToolResult } from '@/src/types/image';
import { ImageFormat } from '@/src/types/formats';
import { createProcessingError } from '@/src/utils/error-handler';
import { ensureCacheDir, generateId, getFileSize } from '@/src/services/file-manager';
import { getImageDimensions } from '@/src/services/image-processor';

export async function cropRotateFlipImage(
  source: ImageAsset,
  options: CropOptions,
  onProgress?: (progress: number) => void,
  reEncodingQuality: number = 0.95,
): Promise<ToolResult> {
  const startTime = Date.now();
  ensureCacheDir();
  onProgress?.(0.1);

  const actions: ImageManipulator.Action[] = [];

  // Crop (only if not full image)
  const isCropped =
    options.originX > 0 ||
    options.originY > 0 ||
    options.width < source.width ||
    options.height < source.height;

  if (isCropped) {
    actions.push({
      crop: {
        originX: options.originX,
        originY: options.originY,
        width: options.width,
        height: options.height,
      },
    });
  }

  // Rotate
  if (options.rotation !== 0) {
    actions.push({ rotate: options.rotation });
  }

  // Flip
  if (options.flipHorizontal) {
    actions.push({ flip: ImageManipulator.FlipType.Horizontal });
  }
  if (options.flipVertical) {
    actions.push({ flip: ImageManipulator.FlipType.Vertical });
  }

  if (actions.length === 0) {
    throw createProcessingError(
      'PROCESSING_FAILED',
      'No crop, rotation, or flip options selected',
      'Select at least one transformation to apply.',
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
      actions,
      saveOptions,
    );

    onProgress?.(0.8);

    const fileSize = getFileSize(result.uri);
    const output: ImageAsset = {
      uri: result.uri,
      fileName: result.uri.split('/').pop() ?? 'cropped.png',
      format: source.format,
      width: result.width,
      height: result.height,
      fileSize,
      mimeType: source.mimeType,
    };

    onProgress?.(1.0);

    return {
      id: generateId(),
      tool: 'crop',
      source,
      output,
      options: { tool: 'crop', config: options },
      processingTimeMs: Date.now() - startTime,
      timestamp: Date.now(),
    };
  } catch (error) {
    throw createProcessingError(
      'PROCESSING_FAILED',
      error instanceof Error ? error.message : 'Crop failed',
    );
  }
}
