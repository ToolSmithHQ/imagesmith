import { useEffect } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useImageStore } from '@/src/stores/use-image-store';
import { useImagePickerHook } from '@/src/hooks/use-image-picker';
import { ImagePickerView } from '@/src/components/image-picker-view';
import { ImagePreview } from '@/src/components/image-preview';
import { FormatPicker } from '@/src/components/format-picker';
import { ConversionConfig } from '@/src/components/conversion-config';
import { SectionCard } from '@/src/components/ui/section-card';
import { Button } from '@/src/components/ui/button';
import { useThemeColor } from '@/src/hooks/use-theme-color';
import { getAvailableTargets } from '@/src/utils/conversion-matrix';
import { triggerImpact } from '@/src/utils/haptics';
import { Spacing } from '@/src/constants/theme';

export default function ConvertScreen() {
  const router = useRouter();
  const backgroundColor = useThemeColor({}, 'background');

  const {
    sourceImage,
    conversionOptions,
    setTargetFormat,
    setQuality,
    setPreserveExif,
    setActiveTool,
    reset,
  } = useImageStore();

  const { pickFromGallery } = useImagePickerHook();

  useEffect(() => {
    reset();
    setActiveTool('convert');
  }, []);

  const hasValidTarget =
    sourceImage &&
    getAvailableTargets(sourceImage.format).includes(
      conversionOptions.targetFormat,
    );

  const handleConvert = () => {
    if (!hasValidTarget) return;
    triggerImpact();
    router.push('/convert/processing');
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

            <SectionCard title="Target Format">
              <FormatPicker
                sourceFormat={sourceImage.format}
                selectedTarget={conversionOptions.targetFormat}
                onSelectTarget={setTargetFormat}
              />
            </SectionCard>

            <SectionCard title="Options">
              <ConversionConfig
                targetFormat={conversionOptions.targetFormat}
                quality={conversionOptions.quality}
                preserveExif={conversionOptions.preserveExif}
                onQualityChange={setQuality}
                onPreserveExifChange={setPreserveExif}
              />
            </SectionCard>

            <Button
              variant="primary"
              title="Convert"
              onPress={handleConvert}
              disabled={!hasValidTarget}
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
