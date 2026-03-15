import * as ImageManipulator from 'expo-image-manipulator';
import { ImageFormat } from '@/src/types/formats';
import {
  ImageAsset,
  ConversionOptions,
  ToolResult,
} from '@/src/types/image';
import { getConversionPath } from '@/src/utils/conversion-matrix';
import { createProcessingError } from '@/src/utils/error-handler';
import {
  ensureCacheDir,
  generateId,
  getFileSize,
} from '@/src/services/file-manager';
import { Image } from 'react-native';
import { FORMAT_MIME_MAP } from '@/src/types/formats';

export async function convertImage(
  source: ImageAsset,
  options: ConversionOptions,
  onProgress?: (progress: number) => void,
): Promise<ToolResult> {
  const startTime = Date.now();
  const conversionPath = getConversionPath(source.format, options.targetFormat);

  if (!conversionPath) {
    throw createProcessingError(
      'UNSUPPORTED_FORMAT',
      `Conversion from ${source.format} to ${options.targetFormat} is not supported`,
    );
  }

  ensureCacheDir();
  onProgress?.(0.1);

  let outputUri: string;

  try {
    switch (conversionPath.library) {
      case 'expo-image-manipulator':
        outputUri = await convertWithManipulator(source, options);
        break;
      default:
        throw createProcessingError(
          'PROCESSING_FAILED',
          `No handler for library: ${conversionPath.library}`,
        );
    }
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error) {
      throw error;
    }
    throw createProcessingError(
      'PROCESSING_FAILED',
      error instanceof Error ? error.message : 'Conversion failed',
    );
  }

  onProgress?.(0.8);

  const outputAsset = await buildOutputAsset(outputUri, options.targetFormat);

  onProgress?.(1.0);

  return {
    id: generateId(),
    tool: 'convert',
    source,
    output: outputAsset,
    options: { tool: 'convert', config: options },
    processingTimeMs: Date.now() - startTime,
    timestamp: Date.now(),
  };
}

async function convertWithManipulator(
  source: ImageAsset,
  options: ConversionOptions,
): Promise<string> {
  const formatMap: Record<string, ImageManipulator.SaveFormat> = {
    [ImageFormat.PNG]: ImageManipulator.SaveFormat.PNG,
    [ImageFormat.WEBP]: ImageManipulator.SaveFormat.WEBP,
  };
  const format = formatMap[options.targetFormat] ?? ImageManipulator.SaveFormat.JPEG;
  const isLossy = format !== ImageManipulator.SaveFormat.PNG;

  const result = await ImageManipulator.manipulateAsync(source.uri, [], {
    format,
    compress: isLossy ? options.quality : undefined,
  });

  return result.uri;
}

export async function buildOutputAsset(
  uri: string,
  format: ImageFormat,
): Promise<ImageAsset> {
  const fileSize = getFileSize(uri);
  const { width, height } = await getImageDimensions(uri);

  const ext = format === ImageFormat.JPEG ? 'jpg' : format;
  const fileName = uri.split('/').pop() ?? `output.${ext}`;

  return {
    uri,
    fileName,
    format,
    width,
    height,
    fileSize,
    mimeType: FORMAT_MIME_MAP[format],
  };
}

export function getImageDimensions(
  uri: string,
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    Image.getSize(
      uri,
      (width, height) => resolve({ width, height }),
      (error) => reject(error),
    );
  });
}
