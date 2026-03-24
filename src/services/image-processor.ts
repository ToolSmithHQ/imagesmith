import { ImageFormat } from '@/src/types/formats';
import {
  ImageAsset,
  ConversionOptions,
  ToolResult,
} from '@/src/types/image';
import { isConversionSupported } from '@/src/utils/conversion-matrix';
import { createProcessingError } from '@/src/utils/error-handler';
import {
  ensureCacheDir,
  generateId,
  getFileSize,
} from '@/src/services/file-manager';
import { convertFile, getFileImageInfo } from '@toolsmith/imagecore-files';
import { FORMAT_MIME_MAP } from '@/src/types/formats';

export async function convertImage(
  source: ImageAsset,
  options: ConversionOptions,
  onProgress?: (progress: number) => void,
): Promise<ToolResult> {
  const startTime = Date.now();

  if (!isConversionSupported(source.format, options.targetFormat)) {
    throw createProcessingError(
      'UNSUPPORTED_FORMAT',
      `Conversion from ${source.format} to ${options.targetFormat} is not supported`,
    );
  }

  ensureCacheDir();
  onProgress?.(0.1);

  try {
    const outputUri = await convertFile(source.uri, options.targetFormat, options.quality);
    onProgress?.(0.8);

    const output = await buildOutputAsset(outputUri, options.targetFormat);
    onProgress?.(1.0);

    return {
      id: generateId(),
      tool: 'convert',
      source,
      output,
      options: { tool: 'convert', config: options },
      processingTimeMs: Date.now() - startTime,
      timestamp: Date.now(),
    };
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error) throw error;
    throw createProcessingError(
      'PROCESSING_FAILED',
      error instanceof Error ? error.message : 'Conversion failed',
    );
  }
}

export async function buildOutputAsset(
  uri: string,
  format: ImageFormat,
): Promise<ImageAsset> {
  const fileSize = getFileSize(uri);
  const info = await getFileImageInfo(uri);
  const ext = format === ImageFormat.JPEG ? 'jpg' : format;
  const fileName = uri.split('/').pop() ?? `output.${ext}`;

  return {
    uri,
    fileName,
    format,
    width: info.width,
    height: info.height,
    fileSize,
    mimeType: FORMAT_MIME_MAP[format],
  };
}

export async function getImageDimensions(
  uri: string,
): Promise<{ width: number; height: number }> {
  try {
    const info = await getFileImageInfo(uri);
    return { width: info.width, height: info.height };
  } catch {
    // Fallback to RN Image.getSize for formats imagecore may not support
    const { Image } = require('react-native');
    return new Promise((resolve, reject) => {
      Image.getSize(
        uri,
        (width: number, height: number) => resolve({ width, height }),
        (error: Error) => reject(error),
      );
    });
  }
}
