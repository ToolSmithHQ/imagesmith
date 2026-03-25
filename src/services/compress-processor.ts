import { ImageAsset, CompressOptions, ToolResult } from '@/src/types/image';
import { createProcessingError } from '@/src/utils/error-handler';
import { ensureCacheDir, generateId, getFileSize } from '@/src/services/file-manager';
import { compressFile, getFileImageInfo } from '@toolsmithhq/imagecore-files';
import { FORMAT_MIME_MAP } from '@/src/types/formats';

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
    const outputUri = await compressFile(source.uri, options.quality, source.format);
    onProgress?.(0.8);

    const fileSize = getFileSize(outputUri);
    const info = await getFileImageInfo(outputUri);

    const output: ImageAsset = {
      uri: outputUri,
      fileName: outputUri.split('/').pop() ?? 'compressed.jpg',
      format: source.format,
      width: info.width,
      height: info.height,
      fileSize,
      mimeType: FORMAT_MIME_MAP[source.format],
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
