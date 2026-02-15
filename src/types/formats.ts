export enum ImageFormat {
  JPEG = 'jpeg',
  PNG = 'png',
  WEBP = 'webp',
  HEIC = 'heic',
  BMP = 'bmp',
  TIFF = 'tiff',
  AVIF = 'avif',
  GIF = 'gif',
}

export const FORMAT_MIME_MAP: Record<ImageFormat, string> = {
  [ImageFormat.JPEG]: 'image/jpeg',
  [ImageFormat.PNG]: 'image/png',
  [ImageFormat.WEBP]: 'image/webp',
  [ImageFormat.HEIC]: 'image/heic',
  [ImageFormat.BMP]: 'image/bmp',
  [ImageFormat.TIFF]: 'image/tiff',
  [ImageFormat.AVIF]: 'image/avif',
  [ImageFormat.GIF]: 'image/gif',
};

export const FORMAT_EXTENSIONS: Record<ImageFormat, string[]> = {
  [ImageFormat.JPEG]: ['.jpg', '.jpeg'],
  [ImageFormat.PNG]: ['.png'],
  [ImageFormat.WEBP]: ['.webp'],
  [ImageFormat.HEIC]: ['.heic', '.heif'],
  [ImageFormat.BMP]: ['.bmp'],
  [ImageFormat.TIFF]: ['.tif', '.tiff'],
  [ImageFormat.AVIF]: ['.avif'],
  [ImageFormat.GIF]: ['.gif'],
};

export const FORMAT_LABELS: Record<ImageFormat, string> = {
  [ImageFormat.JPEG]: 'JPEG',
  [ImageFormat.PNG]: 'PNG',
  [ImageFormat.WEBP]: 'WebP',
  [ImageFormat.HEIC]: 'HEIC',
  [ImageFormat.BMP]: 'BMP',
  [ImageFormat.TIFF]: 'TIFF',
  [ImageFormat.AVIF]: 'AVIF',
  [ImageFormat.GIF]: 'GIF',
};

export interface ConversionPath {
  source: ImageFormat;
  target: ImageFormat;
  phase: 1 | 2 | 3;
  platformSupport: {
    ios: boolean;
    android: boolean;
  };
  library: 'expo-image-manipulator' | 'react-native-heic-converter' | 'react-native-compressor';
}
