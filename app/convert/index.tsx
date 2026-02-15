import { ScrollView, Text, View, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useImageStore } from '@/src/stores/use-image-store';
import { useImagePickerHook } from '@/src/hooks/use-image-picker';
import { ImagePreview } from '@/src/components/image-preview';
import { FormatPicker } from '@/src/components/format-picker';
import { ConversionConfig } from '@/src/components/conversion-config';
import { Button } from '@/src/components/ui/button';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import { getAvailableTargets } from '@/src/utils/conversion-matrix';

export default function ConvertScreen() {
  const router = useRouter();
  const textColor = useThemeColor({}, 'text');
  const iconColor = useThemeColor({}, 'icon');
  const tint = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');

  const {
    sourceImage,
    conversionOptions,
    setTargetFormat,
    setQuality,
    setPreserveExif,
  } = useImageStore();

  const { pickFromGallery, pickFromFiles, isPickerOpen } =
    useImagePickerHook();

  const hasValidTarget =
    sourceImage &&
    getAvailableTargets(sourceImage.format).includes(
      conversionOptions.targetFormat,
    );

  const handleConvert = () => {
    if (!hasValidTarget) return;
    router.push('/convert/processing');
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor }]} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {!sourceImage ? (
          <View style={styles.pickerArea}>
            <Pressable
              onPress={pickFromGallery}
              style={[styles.pickButton, { borderColor: tint }]}
            >
              <IconSymbol name="photo.on.rectangle" size={40} color={tint} />
              <Text style={[styles.pickText, { color: textColor }]}>
                Pick from Gallery
              </Text>
              <Text style={[styles.pickHint, { color: iconColor }]}>
                Select an image to convert
              </Text>
            </Pressable>

            <Pressable
              onPress={pickFromFiles}
              style={[styles.pickButton, { borderColor: iconColor }]}
            >
              <IconSymbol name="folder" size={32} color={iconColor} />
              <Text style={[styles.pickText, { color: textColor }]}>
                Pick from Files
              </Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.configArea}>
            <ImagePreview image={sourceImage} />

            <FormatPicker
              sourceFormat={sourceImage.format}
              selectedTarget={conversionOptions.targetFormat}
              onSelectTarget={setTargetFormat}
            />

            <ConversionConfig
              targetFormat={conversionOptions.targetFormat}
              quality={conversionOptions.quality}
              preserveExif={conversionOptions.preserveExif}
              onQualityChange={setQuality}
              onPreserveExifChange={setPreserveExif}
            />

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
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  content: {
    padding: 20,
    flexGrow: 1,
  },
  pickerArea: {
    flex: 1,
    justifyContent: 'center',
    gap: 16,
  },
  pickButton: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    gap: 8,
  },
  pickText: {
    fontSize: 17,
    fontWeight: '600',
  },
  pickHint: {
    fontSize: 14,
  },
  configArea: {
    gap: 24,
  },
});
