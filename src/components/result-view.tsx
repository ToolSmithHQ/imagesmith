import { useState } from 'react';
import { ScrollView, Text, View, Alert, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { NotificationFeedbackType } from 'expo-haptics';
import { useImageStore } from '@/src/stores/use-image-store';
import { ResultActions } from '@/src/components/result-actions';
import { SectionCard } from '@/src/components/ui/section-card';
import { IconSymbol } from '@/src/components/ui/icon-symbol';
import { saveToGallery, shareImage } from '@/src/services/file-manager';
import { useThemeColor } from '@/src/hooks/use-theme-color';
import { triggerNotification } from '@/src/utils/haptics';
import { formatFileSize } from '@/src/utils/format-file-size';
import { Typography, Spacing, Radius } from '@/src/constants/theme';

interface ResultViewProps {
  toolLabel: string;
  configRoute: string;
}

export function ResultView({ toolLabel, configRoute }: ResultViewProps) {
  const router = useRouter();
  const textColor = useThemeColor({}, 'text');
  const onSurfaceVariant = useThemeColor({}, 'onSurfaceVariant');
  const successColor = useThemeColor({}, 'success');
  const backgroundColor = useThemeColor({}, 'background');
  const surfaceDim = useThemeColor({}, 'surfaceDim');
  const tint = useThemeColor({}, 'tint');

  const { currentResult, reset } = useImageStore();
  const [saving, setSaving] = useState(false);

  if (!currentResult) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor }]}>
        <View style={styles.centered}>
          <Text style={[styles.noResult, { color: onSurfaceVariant }]}>
            No result found.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const { source, output, processingTimeMs } = currentResult;
  const sizeDiff = output.fileSize - source.fileSize;
  const sizeDiffPercent = source.fileSize > 0
    ? Math.round((sizeDiff / source.fileSize) * 100)
    : 0;

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveToGallery(output.uri);
      triggerNotification();
      Alert.alert('Saved', 'Image saved to your gallery.');
    } catch {
      triggerNotification(NotificationFeedbackType.Error);
      Alert.alert('Save Failed', 'Could not save the image. Check gallery permissions.');
    } finally {
      setSaving(false);
    }
  };

  const handleShare = () => {
    shareImage(output.uri);
  };

  const handleAnother = () => {
    reset();
    router.replace(configRoute as any);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor }]} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Before */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: source.uri }}
            style={[styles.previewImage, { backgroundColor: surfaceDim }]}
            contentFit="contain"
          />
          <View style={[styles.pill, { backgroundColor: 'rgba(0,0,0,0.55)' }]}>
            <Text style={styles.pillText}>Before</Text>
          </View>
          <Text style={[styles.imageInfo, { color: onSurfaceVariant }]}>
            {source.width}x{source.height} • {formatFileSize(source.fileSize)}
          </Text>
        </View>

        <View style={styles.arrowContainer}>
          <IconSymbol name="arrow.down" size={20} color={onSurfaceVariant} />
        </View>

        {/* After */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: output.uri }}
            style={[styles.previewImage, { backgroundColor: surfaceDim }]}
            contentFit="contain"
          />
          <View style={[styles.pill, { backgroundColor: tint }]}>
            <Text style={styles.pillText}>After</Text>
          </View>
          <Text style={[styles.imageInfo, { color: onSurfaceVariant }]}>
            {output.width}x{output.height} • {formatFileSize(output.fileSize)}
          </Text>
        </View>

        {/* Stats */}
        <SectionCard>
          <View style={styles.statRow}>
            <Text style={[styles.statLabel, { color: onSurfaceVariant }]}>
              Size change
            </Text>
            <Text
              style={[
                styles.statValue,
                { color: sizeDiff <= 0 ? successColor : textColor },
              ]}
            >
              {sizeDiff <= 0 ? '' : '+'}
              {formatFileSize(Math.abs(sizeDiff))} ({sizeDiffPercent > 0 ? '+' : ''}
              {sizeDiffPercent}%)
            </Text>
          </View>
          <View style={styles.statRow}>
            <Text style={[styles.statLabel, { color: onSurfaceVariant }]}>
              Processing time
            </Text>
            <Text style={[styles.statValue, { color: textColor }]}>
              {processingTimeMs < 1000
                ? `${processingTimeMs}ms`
                : `${(processingTimeMs / 1000).toFixed(1)}s`}
            </Text>
          </View>
        </SectionCard>

        <ResultActions
          onSave={handleSave}
          onShare={handleShare}
          onConvertAnother={handleAnother}
          saving={saving}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: Spacing.xl, gap: Spacing.lg },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  noResult: { ...Typography.bodyLarge },
  imageContainer: {
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    aspectRatio: 3 / 2,
    borderRadius: Radius.lg,
  },
  pill: {
    position: 'absolute',
    bottom: Spacing.sm + 20, // above the info text
    left: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
  },
  pillText: {
    ...Typography.labelSmall,
    color: '#fff',
    fontWeight: '600',
  },
  imageInfo: {
    ...Typography.bodySmall,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
  arrowContainer: {
    alignItems: 'center',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statLabel: {
    ...Typography.bodyMedium,
  },
  statValue: {
    ...Typography.titleMedium,
    fontSize: 14,
  },
});
