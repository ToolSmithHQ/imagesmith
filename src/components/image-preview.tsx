import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Chip } from '@/src/components/ui/chip';
import { FORMAT_DISPLAY } from '@/src/constants/formats';
import { ImageAsset } from '@/src/types/image';
import { formatFileSize } from '@/src/utils/format-file-size';
import { useThemeColor } from '@/src/hooks/use-theme-color';
import { Typography, Spacing, Radius } from '@/src/constants/theme';

interface ImagePreviewProps {
  image: ImageAsset;
}

export function ImagePreview({ image }: ImagePreviewProps) {
  const textColor = useThemeColor({}, 'text');
  const onSurfaceVariant = useThemeColor({}, 'onSurfaceVariant');
  const surfaceDim = useThemeColor({}, 'surfaceDim');
  const display = FORMAT_DISPLAY[image.format];

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: image.uri }}
        style={[styles.image, { backgroundColor: surfaceDim }]}
        contentFit="contain"
      />
      <View style={styles.info}>
        <Chip label={display.label} color={display.color} selected />
        <Text style={[styles.dimensions, { color: onSurfaceVariant }]}>
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
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    aspectRatio: 16 / 10,
    borderRadius: Radius.md,
  },
  info: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingTop: Spacing.md,
  },
  dimensions: {
    ...Typography.bodySmall,
  },
  size: {
    ...Typography.bodySmall,
    fontWeight: '500',
  },
});
