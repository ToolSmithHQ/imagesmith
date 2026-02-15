import { File } from 'expo-file-system/next';
import { ImageFormat, FORMAT_EXTENSIONS } from '@/src/types/formats';

/**
 * Detect image format from file URI.
 * Strategy: extension first (fast), then magic bytes (reliable fallback).
 */
export function detectFormat(uri: string): ImageFormat | null {
  return detectFromExtension(uri);
}

export function detectFromExtension(uri: string): ImageFormat | null {
  const normalized = uri.toLowerCase().split('?')[0];

  for (const [format, extensions] of Object.entries(FORMAT_EXTENSIONS)) {
    if (extensions.some((ext) => normalized.endsWith(ext))) {
      return format as ImageFormat;
    }
  }
  return null;
}

/**
 * Read first bytes of file to detect format via magic bytes.
 * Use when extension is missing or unreliable (e.g., camera captures).
 */
export function detectFormatFromBytes(
  uri: string,
): ImageFormat | null {
  try {
    const file = new File(uri);
    if (!file.exists) return null;

    const handle = file.open();
    const bytes = handle.readBytes(32);
    handle.close();

    // JPEG: FF D8 FF
    if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff)
      return ImageFormat.JPEG;

    // PNG: 89 50 4E 47
    if (
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47
    )
      return ImageFormat.PNG;

    // GIF: 47 49 46 38
    if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46)
      return ImageFormat.GIF;

    // BMP: 42 4D
    if (bytes[0] === 0x42 && bytes[1] === 0x4d) return ImageFormat.BMP;

    // TIFF: 49 49 2A 00 (little-endian) or 4D 4D 00 2A (big-endian)
    if (
      (bytes[0] === 0x49 && bytes[1] === 0x49) ||
      (bytes[0] === 0x4d && bytes[1] === 0x4d)
    )
      return ImageFormat.TIFF;

    // WebP: RIFF....WEBP
    if (
      bytes[0] === 0x52 &&
      bytes[1] === 0x49 &&
      bytes[2] === 0x46 &&
      bytes[3] === 0x46 &&
      bytes[8] === 0x57 &&
      bytes[9] === 0x45 &&
      bytes[10] === 0x42 &&
      bytes[11] === 0x50
    )
      return ImageFormat.WEBP;

    // HEIC/AVIF: ftyp box at offset 4
    if (
      bytes[4] === 0x66 &&
      bytes[5] === 0x74 &&
      bytes[6] === 0x79 &&
      bytes[7] === 0x70
    ) {
      const brand = String.fromCharCode(
        bytes[8],
        bytes[9],
        bytes[10],
        bytes[11],
      );
      if (brand === 'avif' || brand === 'avis') return ImageFormat.AVIF;
      if (brand === 'heic' || brand === 'heix' || brand === 'mif1')
        return ImageFormat.HEIC;
    }

    return null;
  } catch {
    return null;
  }
}
