import { Platform } from 'react-native';
import { ImageFormat, ConversionPath } from '@/src/types/formats';

const CONVERSION_PATHS: ConversionPath[] = [
  // Phase 1: MVP conversions
  {
    source: ImageFormat.JPEG,
    target: ImageFormat.PNG,
    phase: 1,
    platformSupport: { ios: true, android: true },
    library: 'expo-image-manipulator',
  },
  {
    source: ImageFormat.PNG,
    target: ImageFormat.JPEG,
    phase: 1,
    platformSupport: { ios: true, android: true },
    library: 'expo-image-manipulator',
  },
  {
    source: ImageFormat.WEBP,
    target: ImageFormat.PNG,
    phase: 1,
    platformSupport: { ios: true, android: true },
    library: 'expo-image-manipulator',
  },
  {
    source: ImageFormat.WEBP,
    target: ImageFormat.JPEG,
    phase: 1,
    platformSupport: { ios: true, android: true },
    library: 'expo-image-manipulator',
  },
  {
    source: ImageFormat.HEIC,
    target: ImageFormat.JPEG,
    phase: 1,
    platformSupport: { ios: true, android: true },
    library: 'react-native-heic-converter',
  },
  {
    source: ImageFormat.HEIC,
    target: ImageFormat.PNG,
    phase: 1,
    platformSupport: { ios: true, android: true },
    library: 'react-native-heic-converter',
  },
  {
    source: ImageFormat.BMP,
    target: ImageFormat.PNG,
    phase: 1,
    platformSupport: { ios: true, android: true },
    library: 'expo-image-manipulator',
  },

  // Phase 2: Extended
  {
    source: ImageFormat.JPEG,
    target: ImageFormat.HEIC,
    phase: 2,
    platformSupport: { ios: true, android: false },
    library: 'react-native-compressor',
  },
  {
    source: ImageFormat.PNG,
    target: ImageFormat.HEIC,
    phase: 2,
    platformSupport: { ios: true, android: false },
    library: 'react-native-compressor',
  },
  {
    source: ImageFormat.TIFF,
    target: ImageFormat.JPEG,
    phase: 2,
    platformSupport: { ios: true, android: false },
    library: 'expo-image-manipulator',
  },
  {
    source: ImageFormat.AVIF,
    target: ImageFormat.JPEG,
    phase: 2,
    platformSupport: { ios: true, android: true },
    library: 'expo-image-manipulator',
  },
  {
    source: ImageFormat.AVIF,
    target: ImageFormat.PNG,
    phase: 2,
    platformSupport: { ios: true, android: true },
    library: 'expo-image-manipulator',
  },
];

export function getConversionPath(
  source: ImageFormat,
  target: ImageFormat,
): ConversionPath | null {
  const platform = Platform.OS as 'ios' | 'android';

  return (
    CONVERSION_PATHS.find(
      (path) =>
        path.source === source &&
        path.target === target &&
        path.platformSupport[platform],
    ) ?? null
  );
}

export function getAvailableTargets(source: ImageFormat): ImageFormat[] {
  const platform = Platform.OS as 'ios' | 'android';

  return CONVERSION_PATHS.filter(
    (path) => path.source === source && path.platformSupport[platform],
  ).map((path) => path.target);
}

export function isConversionSupported(
  source: ImageFormat,
  target: ImageFormat,
): boolean {
  return getConversionPath(source, target) !== null;
}
