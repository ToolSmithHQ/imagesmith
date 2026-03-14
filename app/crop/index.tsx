import { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useImageStore } from '@/src/stores/use-image-store';
import { useSettingsStore } from '@/src/stores/use-settings-store';
import { useImagePickerHook } from '@/src/hooks/use-image-picker';
import { ImagePickerView } from '@/src/components/image-picker-view';
import { CropOverlay } from '@/src/components/crop-overlay';
import { QualitySlider } from '@/src/components/ui/quality-slider';
import { Button } from '@/src/components/ui/button';
import { IconSymbol } from '@/src/components/ui/icon-symbol';
import { useThemeColor } from '@/src/hooks/use-theme-color';
import { triggerImpact } from '@/src/utils/haptics';
import { ShapeType } from '@/src/types/image';
import { SHAPES } from '@/src/constants/shapes';
import { Typography, Spacing, Radius } from '@/src/constants/theme';

type CropMode = 'rect' | 'shape';

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
  const [cropMode, setCropMode] = useState<CropMode>('rect');
  const [selectedShape, setSelectedShape] = useState<ShapeType | null>(null);
  const [brushStrokes, setBrushStrokes] = useState<{ x: number; y: number }[][]>([]);

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
    (cropMode === 'shape'
      ? selectedShape === 'brush'
        ? brushStrokes.length > 0
        : selectedShape !== null
      : cropOptions.originX > 0 ||
        cropOptions.originY > 0 ||
        cropOptions.width < sourceImage.width ||
        cropOptions.height < sourceImage.height);

  const handleApply = () => {
    if (!hasChanges) return;
    triggerImpact();
    if (cropMode === 'shape' && selectedShape) {
      if (selectedShape === 'brush') {
        setCropOptions({ shape: 'brush', brushStrokes });
      } else {
        setCropOptions({ shape: selectedShape });
      }
    }
    router.push('/crop/processing' as any);
  };

  const selectPreset = (value: number | null) => {
    triggerImpact();
    setAspectRatio(value);
  };

  const handleModeChange = (mode: CropMode) => {
    triggerImpact();
    setCropMode(mode);
    if (mode === 'shape') {
      setAspectRatio(1);
      setCropOptions({ shape: selectedShape });
    } else {
      setAspectRatio(null);
      setSelectedShape(null);
      setBrushStrokes([]);
      setCropOptions({ shape: null, brushStrokes: undefined });
    }
  };

  const handleShapeSelect = (shape: ShapeType) => {
    triggerImpact();
    setSelectedShape(shape);
    setBrushStrokes([]);
    setCropOptions({ shape, brushStrokes: undefined });
  };

  const handleBrushStrokes = (strokes: { x: number; y: number }[][]) => {
    setBrushStrokes(strokes);
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
            key={`${sourceImage.uri}-${cropMode}-${selectedShape}`}
            image={sourceImage}
            aspectRatio={cropMode === 'shape' && selectedShape !== 'brush' ? 1 : aspectRatio}
            shape={cropMode === 'shape' ? selectedShape : null}
            onCropChange={handleCropChange}
            onBrushStrokes={handleBrushStrokes}
          />
        </View>

        <View style={styles.controls}>
          {/* Mode toggle */}
          <View style={[styles.modeToggle, { backgroundColor: surfaceContainerHigh }]}>
            <Pressable
              onPress={() => handleModeChange('rect')}
              style={[
                styles.modeButton,
                cropMode === 'rect' && { backgroundColor: tintContainer },
              ]}
            >
              <Text style={[styles.modeText, { color: cropMode === 'rect' ? tint : textColor }]}>
                Crop
              </Text>
            </Pressable>
            <Pressable
              onPress={() => handleModeChange('shape')}
              style={[
                styles.modeButton,
                cropMode === 'shape' && { backgroundColor: tintContainer },
              ]}
            >
              <Text style={[styles.modeText, { color: cropMode === 'shape' ? tint : textColor }]}>
                Shape
              </Text>
            </Pressable>
          </View>

          {/* Aspect ratio presets (rect mode) or shape selector (shape mode) */}
          {cropMode === 'rect' ? (
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
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.shapesRow}
            >
              {SHAPES.map((s) => {
                const active = selectedShape === s.id;
                return (
                  <Pressable
                    key={s.id}
                    onPress={() => handleShapeSelect(s.id)}
                    style={[
                      styles.shapeChip,
                      {
                        backgroundColor: active ? tintContainer : surfaceContainerHigh,
                      },
                    ]}
                  >
                    <IconSymbol
                      name={s.icon as any}
                      size={18}
                      color={active ? tint : onSurfaceVariant}
                    />
                    <Text
                      style={[
                        styles.shapeText,
                        { color: active ? tint : textColor },
                      ]}
                    >
                      {s.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          )}

          <Text style={[styles.info, { color: onSurfaceVariant }]}>
            {cropOptions.width} x {cropOptions.height}
          </Text>

          {cropMode === 'rect' && (
            <QualitySlider
              value={reEncodingQuality}
              onValueChange={setReEncodingQuality}
            />
          )}

          <Button
            variant="primary"
            title={cropMode === 'shape' ? 'Apply Shape Crop' : 'Apply Crop'}
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
  modeToggle: {
    flexDirection: 'row',
    borderRadius: Radius.xl,
    padding: 3,
    alignSelf: 'center',
  },
  modeButton: {
    paddingHorizontal: 20,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.lg,
  },
  modeText: {
    ...Typography.labelLarge,
    fontWeight: '600',
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
  shapesRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  shapeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.xl,
  },
  shapeText: {
    ...Typography.labelLarge,
    fontWeight: '600',
  },
  info: {
    ...Typography.bodySmall,
    textAlign: 'center',
  },
});
