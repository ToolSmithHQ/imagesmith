import { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useImageStore } from '@/src/stores/use-image-store';
import { useSettingsStore } from '@/src/stores/use-settings-store';
import { useImagePickerHook } from '@/src/hooks/use-image-picker';
import { ImagePickerView } from '@/src/components/image-picker-view';
import { CropOverlay } from '@/src/components/crop-overlay';
import { SectionCard } from '@/src/components/ui/section-card';
import { QualitySlider } from '@/src/components/ui/quality-slider';
import { Button } from '@/src/components/ui/button';
import { useThemeColor } from '@/src/hooks/use-theme-color';
import { triggerImpact } from '@/src/utils/haptics';
import { Typography, Spacing, Radius } from '@/src/constants/theme';

const PRESETS: { label: string; value: number | null }[] = [
  { label: 'Free', value: null },
  { label: '1:1', value: 1 },
  { label: '4:3', value: 4 / 3 },
  { label: '3:2', value: 3 / 2 },
  { label: '16:9', value: 16 / 9 },
];

export default function CropScreen() {
  const router = useRouter();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tint = useThemeColor({}, 'tint');
  const onSurfaceVariant = useThemeColor({}, 'onSurfaceVariant');
  const surfaceContainerHigh = useThemeColor({}, 'surfaceContainerHigh');
  const tintContainer = useThemeColor({}, 'tintContainer');

  const {
    sourceImage,
    cropOptions,
    setActiveTool,
    setCropOptions,
    reset,
  } = useImageStore();

  const { reEncodingQuality, setReEncodingQuality } = useSettingsStore();
  const { pickFromGallery } = useImagePickerHook();
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);

  useEffect(() => {
    reset();
    setActiveTool('crop');
  }, []);

  const handleCropChange = (crop: {
    originX: number;
    originY: number;
    width: number;
    height: number;
  }) => {
    setCropOptions(crop);
  };

  const hasChanges =
    sourceImage &&
    (cropOptions.originX > 0 ||
      cropOptions.originY > 0 ||
      cropOptions.width < sourceImage.width ||
      cropOptions.height < sourceImage.height);

  const handleApply = () => {
    if (!hasChanges) return;
    triggerImpact();
    router.push('/crop/processing' as any);
  };

  const selectPreset = (value: number | null) => {
    triggerImpact();
    setAspectRatio(value);
  };

  if (!sourceImage) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor }]} edges={['bottom']}>
        <ScrollView
          contentContainerStyle={styles.pickerContent}
          showsVerticalScrollIndicator={false}
        >
          <ImagePickerView />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor }]} edges={['bottom']}>
      <View style={styles.container}>
        <View style={styles.overlayContainer}>
          <CropOverlay
            key={sourceImage.uri}
            image={sourceImage}
            aspectRatio={aspectRatio}
            onCropChange={handleCropChange}
          />
        </View>

        <View style={styles.controls}>
          <View style={styles.presetsRow}>
            {PRESETS.map((p) => {
              const active =
                p.value === aspectRatio ||
                (p.value === null && aspectRatio === null);
              return (
                <Pressable
                  key={p.label}
                  onPress={() => selectPreset(p.value)}
                  style={[
                    styles.presetChip,
                    {
                      backgroundColor: active ? tintContainer : surfaceContainerHigh,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.presetText,
                      { color: active ? tint : textColor },
                    ]}
                  >
                    {p.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={[styles.info, { color: onSurfaceVariant }]}>
            {cropOptions.width} x {cropOptions.height}
          </Text>

          <QualitySlider
            value={reEncodingQuality}
            onValueChange={setReEncodingQuality}
          />

          <Button
            variant="primary"
            title="Apply Crop"
            onPress={handleApply}
            disabled={!hasChanges}
          />
          <Button
            variant="ghost"
            title="Pick Different Image"
            onPress={pickFromGallery}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  pickerContent: { padding: Spacing.xl, flexGrow: 1, gap: Spacing.xxl },
  container: { flex: 1 },
  overlayContainer: {
    flex: 1,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.sm,
  },
  controls: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  presetsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    justifyContent: 'center',
  },
  presetChip: {
    paddingHorizontal: 14,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.xl,
  },
  presetText: {
    ...Typography.labelLarge,
    fontWeight: '600',
  },
  info: {
    ...Typography.bodySmall,
    textAlign: 'center',
  },
});
