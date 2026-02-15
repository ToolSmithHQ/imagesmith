import * as ImageManipulator from 'expo-image-manipulator';
import { Image as CompressorImage } from 'react-native-compressor';
import { ImageFormat } from '@/src/types/formats';
import {
  ImageAsset,
  ConversionOptions,
  ConversionResult,
} from '@/src/types/image';
import { getConversionPath } from '@/src/utils/conversion-matrix';
import { createProcessingError } from '@/src/utils/error-handler';
import {
  ensureCacheDir,
  generateId,
  generateOutputUri,
  getFileSize,
} from '@/src/services/file-manager';
import { Image } from 'react-native';

export async function convertImage(
  source: ImageAsset,
  options: ConversionOptions,
  onProgress?: (progress: number) => void,
): Promise<ConversionResult> {
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
      case 'react-native-compressor':
        outputUri = await convertWithCompressor(source, options);
        break;
      case 'react-native-heic-converter':
        outputUri = await convertWithHeicConverter(source, options);
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
    source,
    output: outputAsset,
    options,
    processingTimeMs: Date.now() - startTime,
    timestamp: Date.now(),
  };
}

async function convertWithManipulator(
  source: ImageAsset,
  options: ConversionOptions,
): Promise<string> {
  const format =
    options.targetFormat === ImageFormat.PNG
      ? ImageManipulator.SaveFormat.PNG
      : ImageManipulator.SaveFormat.JPEG;

  const result = await ImageManipulator.manipulateAsync(source.uri, [], {
    format,
    compress:
      options.targetFormat === ImageFormat.JPEG ? options.quality : undefined,
  });

  return result.uri;
}

async function convertWithCompressor(
  source: ImageAsset,
  options: ConversionOptions,
): Promise<string> {
  const result = await CompressorImage.compress(source.uri, {
    compressionMethod: 'manual',
    quality: options.quality,
  });

  return result;
}

async function convertWithHeicConverter(
  source: ImageAsset,
  options: ConversionOptions,
): Promise<string> {
  const RNHeicConverter =
    require('react-native-heic-converter').default;

  const extension = options.targetFormat === ImageFormat.PNG ? 'png' : 'jpg';

  const result = await RNHeicConverter.convert({
    path: source.uri,
    quality: options.quality,
    extension,
  });

  return result.path;
}

async function buildOutputAsset(
  uri: string,
  format: ImageFormat,
): Promise<ImageAsset> {
  const fileSize = getFileSize(uri);
  const { width, height } = await getImageDimensions(uri);

  const ext = format === ImageFormat.JPEG ? 'jpg' : format;
  const fileName = uri.split('/').pop() ?? `converted.${ext}`;

  return {
    uri,
    fileName,
    format,
    width,
    height,
    fileSize,
    mimeType: `image/${format}`,
  };
}

function getImageDimensions(
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
