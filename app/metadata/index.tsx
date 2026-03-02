import { useEffect } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useImageStore } from '@/src/stores/use-image-store';
import { useImagePickerHook } from '@/src/hooks/use-image-picker';
import { useMetadata } from '@/src/hooks/use-metadata';
import { ImagePickerView } from '@/src/components/image-picker-view';
import { ImagePreview } from '@/src/components/image-preview';
import { MetadataViewer } from '@/src/components/metadata-viewer';
import { Button } from '@/src/components/ui/button';
import { useThemeColor } from '@/src/hooks/use-theme-color';
import { triggerImpact } from '@/src/utils/haptics';
import { Spacing } from '@/src/constants/theme';

export default function MetadataScreen() {
  const router = useRouter();
  const backgroundColor = useThemeColor({}, 'background');

  const { sourceImage, setActiveTool, reset } = useImageStore();
  const { pickFromGallery } = useImagePickerHook();
  const { metadataResult, loading, error, loadMetadata, clearMetadata } =
    useMetadata();

  useEffect(() => {
    reset();
    setActiveTool('metadata');
  }, []);

  useEffect(() => {
    if (sourceImage) {
      loadMetadata(sourceImage);
    } else {
      clearMetadata();
    }
  }, [sourceImage]);

  const handleStrip = () => {
    triggerImpact();
    router.push('/metadata/processing' as any);
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

            <MetadataViewer
              exifData={metadataResult?.exifData ?? null}
              loading={loading}
              error={error}
              onStripMetadata={handleStrip}
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
