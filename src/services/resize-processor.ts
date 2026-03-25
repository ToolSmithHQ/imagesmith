import { ImageAsset, ResizeOptions, ToolResult } from '@/src/types/image';
import { createProcessingError } from '@/src/utils/error-handler';
import { ensureCacheDir, generateId, getFileSize } from '@/src/services/file-manager';
import { resizeFile, getFileImageInfo } from '@toolsmithhq/imagecore-files';
import { FORMAT_MIME_MAP } from '@/src/types/formats';

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
    const outputUri = await resizeFile(
      source.uri,
      options.width,
      options.height,
      source.format,
      reEncodingQuality,
    );

    onProgress?.(0.8);

    const fileSize = getFileSize(outputUri);
    const info = await getFileImageInfo(outputUri);

    const output: ImageAsset = {
      uri: outputUri,
      fileName: outputUri.split('/').pop() ?? 'resized.png',
      format: source.format,
      width: info.width,
      height: info.height,
      fileSize,
      mimeType: FORMAT_MIME_MAP[source.format],
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
