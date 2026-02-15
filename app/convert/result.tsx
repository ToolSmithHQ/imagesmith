import { useState } from 'react';
import { ScrollView, Text, View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useImageStore } from '@/src/stores/use-image-store';
import { ResultActions } from '@/src/components/result-actions';
import { Chip } from '@/src/components/ui/chip';
import { FORMAT_DISPLAY } from '@/src/constants/formats';
import { saveToGallery, shareImage } from '@/src/services/file-manager';
import { useThemeColor } from '@/hooks/use-theme-color';

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

export default function ResultScreen() {
  const router = useRouter();
  const textColor = useThemeColor({}, 'text');
  const iconColor = useThemeColor({}, 'icon');
  const successColor = useThemeColor({}, 'success');
  const backgroundColor = useThemeColor({}, 'background');

  const { currentResult, reset } = useImageStore();
  const [saving, setSaving] = useState(false);

  if (!currentResult) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor }]}>
        <View style={styles.centered}>
          <Text style={[styles.noResult, { color: iconColor }]}>
            No conversion result found.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const { source, output, processingTimeMs } = currentResult;
  const sourceDisplay = FORMAT_DISPLAY[source.format];
  const outputDisplay = FORMAT_DISPLAY[output.format];
  const sizeDiff = output.fileSize - source.fileSize;
  const sizeDiffPercent = Math.round((sizeDiff / source.fileSize) * 100);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveToGallery(output.uri);
    } finally {
      setSaving(false);
    }
  };

  const handleShare = () => {
    shareImage(output.uri);
  };

  const handleConvertAnother = () => {
    reset();
    router.replace('/convert');
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor }]} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.comparison}>
          <View style={styles.imageColumn}>
            <Image
              source={{ uri: source.uri }}
              style={styles.previewImage}
              contentFit="contain"
            />
            <Chip
              label={sourceDisplay.label}
              color={sourceDisplay.color}
              selected
            />
            <Text style={[styles.fileSize, { color: iconColor }]}>
              {formatFileSize(source.fileSize)}
            </Text>
          </View>

          <Text style={[styles.arrow, { color: iconColor }]}>→</Text>

          <View style={styles.imageColumn}>
            <Image
              source={{ uri: output.uri }}
              style={styles.previewImage}
              contentFit="contain"
            />
            <Chip
              label={outputDisplay.label}
              color={outputDisplay.color}
              selected
            />
            <Text style={[styles.fileSize, { color: iconColor }]}>
              {formatFileSize(output.fileSize)}
            </Text>
          </View>
        </View>

        <View style={styles.stats}>
          <View style={styles.statRow}>
            <Text style={[styles.statLabel, { color: iconColor }]}>
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
            <Text style={[styles.statLabel, { color: iconColor }]}>
              Processing time
            </Text>
            <Text style={[styles.statValue, { color: textColor }]}>
              {processingTimeMs < 1000
                ? `${processingTimeMs}ms`
                : `${(processingTimeMs / 1000).toFixed(1)}s`}
            </Text>
          </View>
          <View style={styles.statRow}>
            <Text style={[styles.statLabel, { color: iconColor }]}>
              Dimensions
            </Text>
            <Text style={[styles.statValue, { color: textColor }]}>
              {output.width} x {output.height}
            </Text>
          </View>
        </View>

        <ResultActions
          onSave={handleSave}
          onShare={handleShare}
          onConvertAnother={handleConvertAnother}
          saving={saving}
        />
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
    gap: 24,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noResult: {
    fontSize: 16,
  },
  comparison: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  imageColumn: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  previewImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
    backgroundColor: 'rgba(128,128,128,0.1)',
  },
  arrow: {
    fontSize: 24,
    fontWeight: '600',
  },
  fileSize: {
    fontSize: 12,
  },
  stats: {
    gap: 12,
    paddingVertical: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(128,128,128,0.2)',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statLabel: {
    fontSize: 14,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '500',
  },
});
