import { View, Text, StyleSheet } from 'react-native';
import { IconSymbol } from '@/src/components/ui/icon-symbol';
import { AnimatedPressable } from '@/src/components/ui/animated-pressable';
import { useThemeColor } from '@/src/hooks/use-theme-color';
import { useImagePickerHook } from '@/src/hooks/use-image-picker';
import { Typography, Spacing, Radius } from '@/src/constants/theme';

export function ImagePickerView() {
  const textColor = useThemeColor({}, 'text');
  const tint = useThemeColor({}, 'tint');
  const surfaceContainer = useThemeColor({}, 'surfaceContainer');
  const surfaceContainerLow = useThemeColor({}, 'surfaceContainerLow');
  const tintContainer = useThemeColor({}, 'tintContainer');
  const onTintContainer = useThemeColor({}, 'onTintContainer');
  const onSurfaceVariant = useThemeColor({}, 'onSurfaceVariant');

  const { pickFromGallery, pickFromFiles } = useImagePickerHook();

  return (
    <View style={styles.container}>
      <AnimatedPressable
        onPress={pickFromGallery}
        style={[styles.primaryCard, { backgroundColor: surfaceContainer }]}
      >
        <View style={[styles.iconCircle, { backgroundColor: tintContainer }]}>
          <IconSymbol name="photo.on.rectangle" size={28} color={onTintContainer} />
        </View>
        <Text style={[styles.primaryTitle, { color: textColor }]}>
          Choose from Gallery
        </Text>
        <Text style={[styles.primaryHint, { color: onSurfaceVariant }]}>
          Select a photo or image to get started
        </Text>
      </AnimatedPressable>

      <AnimatedPressable
        onPress={pickFromFiles}
        style={[styles.secondaryCard, { backgroundColor: surfaceContainerLow }]}
      >
        <IconSymbol name="folder" size={22} color={tint} />
        <Text style={[styles.secondaryText, { color: textColor }]}>
          Browse Files
        </Text>
      </AnimatedPressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    gap: Spacing.md,
  },
  primaryCard: {
    borderRadius: Radius.xxl,
    padding: Spacing.xxxl,
    alignItems: 'center',
    gap: Spacing.md,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  primaryTitle: {
    ...Typography.titleMedium,
  },
  primaryHint: {
    ...Typography.bodySmall,
    textAlign: 'center',
  },
  secondaryCard: {
    borderRadius: Radius.lg,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  secondaryText: {
    ...Typography.labelLarge,
  },
});
