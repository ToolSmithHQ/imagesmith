import {
  ImageAsset,
  ExifData,
  MetadataResult,
  ToolResult,
} from '@/src/types/image';
import { createProcessingError } from '@/src/utils/error-handler';
import { ensureCacheDir, generateId, getFileSize } from '@/src/services/file-manager';
import { readFileExif, stripFileExif, getFileImageInfo } from '@toolsmithhq/imagecore-files';

export async function readMetadata(source: ImageAsset): Promise<MetadataResult> {
  try {
    const info = await getFileImageInfo(source.uri);
    const rawExif = await readFileExif(source.uri);

    const exifData: ExifData = {
      'Image Info': {
        Width: info.width,
        Height: info.height,
        Format: info.format,
        'File Size': info.fileSize,
      },
    };

    if (Object.keys(rawExif).length > 0) {
      exifData['EXIF Data'] = rawExif as Record<string, string | number | undefined>;
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
    const outputUri = await stripFileExif(source.uri);
    onProgress?.(0.8);

    const fileSize = getFileSize(outputUri);
    const info = await getFileImageInfo(outputUri);

    const output: ImageAsset = {
      uri: outputUri,
      fileName: `stripped_${source.fileName}`,
      format: source.format,
      width: info.width,
      height: info.height,
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
