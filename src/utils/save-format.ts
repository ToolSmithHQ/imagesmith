import * as ImageManipulator from 'expo-image-manipulator';
import { ImageFormat, FORMAT_MIME_MAP } from '@/src/types/formats';

/**
 * Maps a source ImageFormat to the best expo-image-manipulator SaveOptions
 * that preserves the original format where possible.
 *
 * - JPEG → JPEG
 * - PNG, BMP, TIFF → PNG (lossless)
 * - WebP → WebP
 * - HEIC, AVIF, GIF → JPEG (no native encoding support)
 */
export function getSaveOptions(
  sourceFormat: ImageFormat,
  quality: number = 0.95,
): ImageManipulator.SaveOptions {
  switch (sourceFormat) {
    case ImageFormat.PNG:
    case ImageFormat.BMP:
    case ImageFormat.TIFF:
      return { format: ImageManipulator.SaveFormat.PNG };
    case ImageFormat.WEBP:
      return { format: ImageManipulator.SaveFormat.WEBP, compress: quality };
    case ImageFormat.JPEG:
    default:
      return { format: ImageManipulator.SaveFormat.JPEG, compress: quality };
  }
}

/**
 * Returns the actual output ImageFormat after processing.
 * Some formats (HEIC, AVIF, GIF) can't be re-encoded, so the output
 * format differs from the source.
 */
export function getOutputFormat(sourceFormat: ImageFormat): ImageFormat {
  switch (sourceFormat) {
    case ImageFormat.PNG:
    case ImageFormat.BMP:
    case ImageFormat.TIFF:
      return ImageFormat.PNG;
    case ImageFormat.WEBP:
      return ImageFormat.WEBP;
    case ImageFormat.JPEG:
      return ImageFormat.JPEG;
    default:
      // HEIC, AVIF, GIF → JPEG
      return ImageFormat.JPEG;
  }
}

/**
 * Returns the correct MIME type for the actual output format.
 */
export function getOutputMimeType(sourceFormat: ImageFormat): string {
  return FORMAT_MIME_MAP[getOutputFormat(sourceFormat)];
}
