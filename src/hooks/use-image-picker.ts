import { useCallback, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Image } from 'react-native';
import { ImageAsset } from '@/src/types/image';
import {
  detectFormat,
  detectFormatFromBytes,
} from '@/src/utils/format-detection';
import { useImageStore } from '@/src/stores/use-image-store';
import { createProcessingError } from '@/src/utils/error-handler';

export function useImagePickerHook() {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const { setSourceImage } = useImageStore();

  const pickFromGallery = useCallback(async (): Promise<ImageAsset | null> => {
    setIsPickerOpen(true);
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        throw createProcessingError(
          'PERMISSION_DENIED',
          'Gallery permission not granted',
          'Gallery access is required to pick images.',
        );
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 1,
        exif: true,
      });

      if (result.canceled || !result.assets[0]) return null;

      const asset = result.assets[0];
      const format =
        detectFormat(asset.uri) ?? (detectFormatFromBytes(asset.uri));

      if (!format) {
        throw createProcessingError(
          'UNSUPPORTED_FORMAT',
          'Could not detect image format',
          'This image format is not recognized.',
        );
      }

      const imageAsset: ImageAsset = {
        uri: asset.uri,
        fileName: asset.fileName ?? `image.${format}`,
        format,
        width: asset.width,
        height: asset.height,
        fileSize: asset.fileSize ?? 0,
        mimeType: asset.mimeType ?? `image/${format}`,
      };

      setSourceImage(imageAsset);
      return imageAsset;
    } finally {
      setIsPickerOpen(false);
    }
  }, [setSourceImage]);

  const pickFromFiles = useCallback(async (): Promise<ImageAsset | null> => {
    setIsPickerOpen(true);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'image/*',
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets[0]) return null;

      const doc = result.assets[0];
      const format =
        detectFormat(doc.uri) ?? detectFormatFromBytes(doc.uri);

      if (!format) {
        throw createProcessingError(
          'UNSUPPORTED_FORMAT',
          'Could not detect image format',
          'This image format is not recognized.',
        );
      }

      const { width, height } = await getImageDimensions(doc.uri);

      const imageAsset: ImageAsset = {
        uri: doc.uri,
        fileName: doc.name,
        format,
        width,
        height,
        fileSize: doc.size ?? 0,
        mimeType: doc.mimeType ?? `image/${format}`,
      };

      setSourceImage(imageAsset);
      return imageAsset;
    } finally {
      setIsPickerOpen(false);
    }
  }, [setSourceImage]);

  return { pickFromGallery, pickFromFiles, isPickerOpen };
}

function getImageDimensions(
  uri: string,
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    Image.getSize(
      uri,
      (width, height) => resolve({ width, height }),
      (error) => reject(error),
    );
  });
}
