import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Chip } from '@/src/components/ui/chip';
import { FORMAT_DISPLAY } from '@/src/constants/formats';
import { ImageAsset } from '@/src/types/image';
import { useThemeColor } from '@/hooks/use-theme-color';

interface ImagePreviewProps {
  image: ImageAsset;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

export function ImagePreview({ image }: ImagePreviewProps) {
  const textColor = useThemeColor({}, 'text');
  const iconColor = useThemeColor({}, 'icon');
  const display = FORMAT_DISPLAY[image.format];

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: image.uri }}
        style={styles.image}
        contentFit="contain"
      />
      <View style={styles.info}>
        <Chip label={display.label} color={display.color} selected />
        <Text style={[styles.dimensions, { color: iconColor }]}>
          {image.width} x {image.height}
        </Text>
        <Text style={[styles.size, { color: textColor }]}>
          {formatFileSize(image.fileSize)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
    backgroundColor: 'rgba(128,128,128,0.1)',
  },
  info: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: 12,
  },
  dimensions: {
    fontSize: 13,
  },
  size: {
    fontSize: 13,
    fontWeight: '500',
  },
});
