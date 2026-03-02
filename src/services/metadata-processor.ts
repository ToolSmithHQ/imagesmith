import { getImageMetaData } from 'react-native-compressor';
import * as ImageManipulator from 'expo-image-manipulator';
import {
  ImageAsset,
  ExifData,
  MetadataResult,
  ToolResult,
} from '@/src/types/image';
import { ImageFormat } from '@/src/types/formats';
import { createProcessingError } from '@/src/utils/error-handler';
import { ensureCacheDir, generateId, getFileSize } from '@/src/services/file-manager';

export async function readMetadata(source: ImageAsset): Promise<MetadataResult> {
  try {
    const metadata = await getImageMetaData(source.uri);

    const exifData: ExifData = {
      'Image Info': {
        Width: metadata.ImageWidth,
        Height: metadata.ImageHeight,
        Orientation: metadata.Orientation,
        'File Size': metadata.size,
        Extension: metadata.extension,
      },
    };

    if (metadata.exif) {
      exifData['EXIF Data'] = metadata.exif as Record<string, string | number | undefined>;
    }

    return {
      id: generateId(),
      source,
      exifData,
      timestamp: Date.now(),
    };
  } catch (error) {
    throw createProcessingError(
      'METADATA_READ_FAILED',
      error instanceof Error ? error.message : 'Failed to read metadata',
    );
  }
}

export async function stripMetadata(
  source: ImageAsset,
  onProgress?: (progress: number) => void,
): Promise<ToolResult> {
  const startTime = Date.now();
  ensureCacheDir();
  onProgress?.(0.2);

  try {
    // Re-encoding with expo-image-manipulator strips EXIF data
    // Use source format to avoid unnecessary format conversion
    const isLossless =
      source.format === ImageFormat.PNG ||
      source.format === ImageFormat.BMP ||
      source.format === ImageFormat.TIFF;

    const saveOptions: ImageManipulator.SaveOptions = isLossless
      ? { format: ImageManipulator.SaveFormat.PNG }
      : { format: ImageManipulator.SaveFormat.JPEG, compress: 1.0 };

    const result = await ImageManipulator.manipulateAsync(
      source.uri,
      [],
      saveOptions,
    );

    onProgress?.(0.8);

    const fileSize = getFileSize(result.uri);
    const output: ImageAsset = {
      uri: result.uri,
      fileName: `stripped_${source.fileName}`,
      format: source.format,
      width: result.width,
      height: result.height,
      fileSize,
      mimeType: source.mimeType,
    };

    onProgress?.(1.0);

    return {
      id: generateId(),
      tool: 'metadata',
      source,
      output,
      options: { tool: 'metadata', config: { action: 'strip' } },
      processingTimeMs: Date.now() - startTime,
      timestamp: Date.now(),
    };
  } catch (error) {
    throw createProcessingError(
      'PROCESSING_FAILED',
      error instanceof Error ? error.message : 'Failed to strip metadata',
    );
  }
}
