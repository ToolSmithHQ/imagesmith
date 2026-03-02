import { useEffect } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useImageStore } from '@/src/stores/use-image-store';
import { useSettingsStore } from '@/src/stores/use-settings-store';
import { useImagePickerHook } from '@/src/hooks/use-image-picker';
import { ImagePickerView } from '@/src/components/image-picker-view';
import { RotateConfig } from '@/src/components/rotate-config';
import { SectionCard } from '@/src/components/ui/section-card';
import { QualitySlider } from '@/src/components/ui/quality-slider';
import { Button } from '@/src/components/ui/button';
import { useThemeColor } from '@/src/hooks/use-theme-color';
import { triggerImpact } from '@/src/utils/haptics';
import { Spacing } from '@/src/constants/theme';

export default function RotateScreen() {
  const router = useRouter();
  const backgroundColor = useThemeColor({}, 'background');

  const {
    sourceImage,
    cropOptions,
    setActiveTool,
    setRotation,
    toggleFlipH,
    toggleFlipV,
    reset,
  } = useImageStore();

  const { reEncodingQuality, setReEncodingQuality } = useSettingsStore();
  const { pickFromGallery } = useImagePickerHook();

  useEffect(() => {
    reset();
    setActiveTool('rotate');
  }, []);

  const hasChanges =
    cropOptions.rotation !== 0 ||
    cropOptions.flipHorizontal ||
    cropOptions.flipVertical;

  const rotateLeft = () => {
    setRotation(((cropOptions.rotation - 90) % 360 + 360) % 360);
  };

  const rotateRight = () => {
    setRotation((cropOptions.rotation + 90) % 360);
  };

  const handleApply = () => {
    if (!hasChanges) return;
    triggerImpact();
    router.push('/rotate/processing' as any);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor }]} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {!sourceImage ? (
          <ImagePickerView />
        ) : (
          <>
            <RotateConfig
              image={sourceImage}
              rotation={cropOptions.rotation}
              flipH={cropOptions.flipHorizontal}
              flipV={cropOptions.flipVertical}
              onRotateLeft={rotateLeft}
              onRotateRight={rotateRight}
              onSetRotation={setRotation}
              onToggleFlipH={toggleFlipH}
              onToggleFlipV={toggleFlipV}
            />

            <SectionCard title="Output Quality">
              <QualitySlider
                value={reEncodingQuality}
                onValueChange={setReEncodingQuality}
              />
            </SectionCard>

            <Button
              variant="primary"
              title="Apply"
              onPress={handleApply}
              disabled={!hasChanges}
            />

            <Button
              variant="ghost"
              title="Pick Different Image"
              onPress={pickFromGallery}
            />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: Spacing.xl, flexGrow: 1, gap: Spacing.lg },
});
