import { ImageFormat, FORMAT_LABELS } from '@/src/types/formats';

export interface FormatDisplayConfig {
  label: string;
  color: string;
  lossy: boolean;
}

export const FORMAT_DISPLAY: Record<ImageFormat, FormatDisplayConfig> = {
  [ImageFormat.JPEG]: { label: FORMAT_LABELS[ImageFormat.JPEG], color: '#E74C3C', lossy: true },
  [ImageFormat.PNG]: { label: FORMAT_LABELS[ImageFormat.PNG], color: '#3498DB', lossy: false },
  [ImageFormat.WEBP]: { label: FORMAT_LABELS[ImageFormat.WEBP], color: '#2ECC71', lossy: true },
  [ImageFormat.HEIC]: { label: FORMAT_LABELS[ImageFormat.HEIC], color: '#9B59B6', lossy: true },
  [ImageFormat.BMP]: { label: FORMAT_LABELS[ImageFormat.BMP], color: '#F39C12', lossy: false },
  [ImageFormat.TIFF]: { label: FORMAT_LABELS[ImageFormat.TIFF], color: '#1ABC9C', lossy: false },
  [ImageFormat.AVIF]: { label: FORMAT_LABELS[ImageFormat.AVIF], color: '#E67E22', lossy: true },
  [ImageFormat.GIF]: { label: FORMAT_LABELS[ImageFormat.GIF], color: '#FF6B81', lossy: true },
};
