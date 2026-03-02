import { useEffect } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useImageStore } from '@/src/stores/use-image-store';
import { useImagePickerHook } from '@/src/hooks/use-image-picker';
import { ImagePickerView } from '@/src/components/image-picker-view';
import { ImagePreview } from '@/src/components/image-preview';
import { CompressConfig } from '@/src/components/compress-config';
import { SectionCard } from '@/src/components/ui/section-card';
import { Button } from '@/src/components/ui/button';
import { useThemeColor } from '@/src/hooks/use-theme-color';
import { triggerImpact } from '@/src/utils/haptics';
import { Spacing } from '@/src/constants/theme';

export default function CompressScreen() {
  const router = useRouter();
  const backgroundColor = useThemeColor({}, 'background');

  const {
    sourceImage,
    compressOptions,
    setActiveTool,
    setCompressQuality,
    reset,
  } = useImageStore();

  const { pickFromGallery } = useImagePickerHook();

  useEffect(() => {
    reset();
    setActiveTool('compress');
  }, []);

  const handleCompress = () => {
    if (!sourceImage) return;
    triggerImpact();
    router.push('/compress/processing' as any);
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

            <SectionCard title="Compression">
              <CompressConfig
                quality={compressOptions.quality}
                originalSize={sourceImage.fileSize}
                onQualityChange={setCompressQuality}
              />
            </SectionCard>

            <Button
              variant="primary"
              title="Compress"
              onPress={handleCompress}
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
