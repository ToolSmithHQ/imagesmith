import { File, Paths, Directory } from 'expo-file-system/next';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { createProcessingError } from '@/src/utils/error-handler';

const CACHE_DIR_NAME = 'imagesmith';

function getCacheDir(): Directory {
  return new Directory(Paths.cache, CACHE_DIR_NAME);
}

export function ensureCacheDir(): void {
  const dir = getCacheDir();
  if (!dir.exists) {
    dir.create();
  }
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
}

export async function saveToGallery(
  uri: string,
  albumName = 'Image Smith',
): Promise<string> {
  const { status } = await MediaLibrary.requestPermissionsAsync();
  if (status !== 'granted') {
    throw createProcessingError(
      'PERMISSION_DENIED',
      'Media library permission not granted',
      'Gallery permission is required to save images.',
    );
  }

  const asset = await MediaLibrary.createAssetAsync(uri);

  const album = await MediaLibrary.getAlbumAsync(albumName);
  if (album) {
    await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
  } else {
    await MediaLibrary.createAlbumAsync(albumName, asset, false);
  }

  return asset.uri;
}

export async function shareImage(uri: string): Promise<void> {
  const isAvailable = await Sharing.isAvailableAsync();
  if (!isAvailable) {
    throw createProcessingError(
      'UNKNOWN',
      'Sharing not available',
      'Sharing is not available on this device.',
    );
  }
  await Sharing.shareAsync(uri);
}

export function getFileSize(uri: string): number {
  try {
    const file = new File(uri);
    return file.exists ? file.size ?? 0 : 0;
  } catch {
    return 0;
  }
}

