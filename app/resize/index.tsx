import { useEffect } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useImageStore } from '@/src/stores/use-image-store';
import { useSettingsStore } from '@/src/stores/use-settings-store';
import { useImagePickerHook } from '@/src/hooks/use-image-picker';
import { ImagePickerView } from '@/src/components/image-picker-view';
import { ImagePreview } from '@/src/components/image-preview';
import { ResizeConfig } from '@/src/components/resize-config';
import { SectionCard } from '@/src/components/ui/section-card';
import { QualitySlider } from '@/src/components/ui/quality-slider';
import { Button } from '@/src/components/ui/button';
import { useThemeColor } from '@/src/hooks/use-theme-color';
import { triggerImpact } from '@/src/utils/haptics';
import { Spacing } from '@/src/constants/theme';

export default function ResizeScreen() {
  const router = useRouter();
  const backgroundColor = useThemeColor({}, 'background');

  const {
    sourceImage,
    resizeOptions,
    setActiveTool,
    setResizeOptions,
    reset,
  } = useImageStore();

  const { reEncodingQuality, setReEncodingQuality } = useSettingsStore();
  const { pickFromGallery } = useImagePickerHook();

  useEffect(() => {
    reset();
    setActiveTool('resize');
  }, []);

  const hasChanges =
    sourceImage &&
    (resizeOptions.width !== sourceImage.width ||
      resizeOptions.height !== sourceImage.height);

  const handleResize = () => {
    if (!hasChanges) return;
    triggerImpact();
    router.push('/resize/processing' as any);
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
            <ImagePreview image={sourceImage} />

            <SectionCard title="Dimensions">
              <ResizeConfig
                sourceWidth={sourceImage.width}
                sourceHeight={sourceImage.height}
                width={resizeOptions.width}
                height={resizeOptions.height}
                lockAspectRatio={resizeOptions.lockAspectRatio}
                onWidthChange={(w) => setResizeOptions({ width: w })}
                onHeightChange={(h) => setResizeOptions({ height: h })}
                onToggleLock={() =>
                  setResizeOptions({ lockAspectRatio: !resizeOptions.lockAspectRatio })
                }
              />
            </SectionCard>

            <SectionCard title="Output Quality">
              <QualitySlider
                value={reEncodingQuality}
                onValueChange={setReEncodingQuality}
              />
            </SectionCard>

            <Button
              variant="primary"
              title="Resize"
              onPress={handleResize}
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
