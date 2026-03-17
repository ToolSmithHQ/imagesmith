import { ImageFormat } from '@/src/types/formats';

/**
 * With imagecore, all format conversions are supported on all platforms.
 * No more per-platform restrictions or phase gating.
 */

const ALL_FORMATS = [
  ImageFormat.JPEG,
  ImageFormat.PNG,
  ImageFormat.WEBP,
  ImageFormat.HEIC,
  ImageFormat.AVIF,
  ImageFormat.TIFF,
  ImageFormat.BMP,
];

export function getAvailableTargets(source: ImageFormat): ImageFormat[] {
  if (!ALL_FORMATS.includes(source)) return [];
  return ALL_FORMATS.filter((f) => f !== source);
}

export function isConversionSupported(
  source: ImageFormat,
  target: ImageFormat,
): boolean {
  return source !== target &&
    ALL_FORMATS.includes(source) &&
    ALL_FORMATS.includes(target);
}
