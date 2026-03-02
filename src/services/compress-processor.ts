import { Image as CompressorImage } from 'react-native-compressor';
import { ImageAsset, CompressOptions, ToolResult } from '@/src/types/image';
import { createProcessingError } from '@/src/utils/error-handler';
import { ensureCacheDir, generateId, getFileSize } from '@/src/services/file-manager';
import { getImageDimensions } from '@/src/services/image-processor';

export async function compressImage(
  source: ImageAsset,
  options: CompressOptions,
  onProgress?: (progress: number) => void,
): Promise<ToolResult> {
  const startTime = Date.now();
  ensureCacheDir();
  onProgress?.(0.1);

  onProgress?.(0.3);

  try {
    const result = await CompressorImage.compress(source.uri, {
      compressionMethod: 'manual',
      quality: options.quality,
      maxWidth: options.maxWidth,
      maxHeight: options.maxHeight,
    });

    onProgress?.(0.8);

    const fileSize = getFileSize(result);
    const { width, height } = await getImageDimensions(result);

    const output: ImageAsset = {
      uri: result,
      fileName: result.split('/').pop() ?? 'compressed.jpg',
      format: source.format,
      width,
      height,
      fileSize,
      mimeType: source.mimeType,
    };

    onProgress?.(1.0);

    return {
      id: generateId(),
      tool: 'compress',
      source,
      output,
      options: { tool: 'compress', config: options },
      processingTimeMs: Date.now() - startTime,
      timestamp: Date.now(),
    };
  } catch (error) {
    throw createProcessingError(
      'PROCESSING_FAILED',
      error instanceof Error ? error.message : 'Compression failed',
    );
  }
}