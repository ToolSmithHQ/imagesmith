import { View, Text, Pressable, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { useThemeColor } from '@/src/hooks/use-theme-color';
import { triggerImpact } from '@/src/utils/haptics';
import { formatFileSize } from '@/src/utils/format-file-size';

interface CompressConfigProps {
  quality: number;
  originalSize: number;
  onQualityChange: (quality: number) => void;
}

const PRESETS = [
  { label: 'Low', quality: 0.3 },
  { label: 'Medium', quality: 0.6 },
  { label: 'High', quality: 0.8 },
  { label: 'Max', quality: 0.95 },
];

export function CompressConfig({
  quality,
  originalSize,
  onQualityChange,
}: CompressConfigProps) {
  const textColor = useThemeColor({}, 'text');
  const iconColor = useThemeColor({}, 'icon');
  const tint = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({}, 'border');

  return (
    <View style={styles.container}>
      <View style={styles.qualityRow}>
        <Text style={[styles.label, { color: textColor }]}>Quality</Text>
        <Text style={[styles.value, { color: tint }]}>
          {Math.round(quality * 100)}%
        </Text>
      </View>

      <Slider
        minimumValue={0.1}
        maximumValue={1}
        value={quality}
        onValueChange={onQualityChange}
        minimumTrackTintColor={tint}
        maximumTrackTintColor={`${iconColor}40`}
        step={0.05}
      />

      <View style={styles.presets}>
        {PRESETS.map((preset) => (
          <Pressable
            key={preset.label}
            onPress={() => {
              triggerImpact();
              onQualityChange(preset.quality);
            }}
            style={[
              styles.presetButton,
              {
                borderColor: Math.abs(quality - preset.quality) < 0.05 ? tint : borderColor,
                backgroundColor:
                  Math.abs(quality - preset.quality) < 0.05 ? `${tint}15` : 'transparent',
              },
            ]}
          >
            <Text
              style={[
                styles.presetText,
                {
                  color: Math.abs(quality - preset.quality) < 0.05 ? tint : textColor,
                },
              ]}
            >
              {preset.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.sizeInfo}>
        <View style={styles.sizeRow}>
          <Text style={[styles.sizeLabel, { color: iconColor }]}>Original</Text>
          <Text style={[styles.sizeValue, { color: textColor }]}>
            {formatFileSize(originalSize)}
          </Text>
        </View>
        <Text style={[styles.note, { color: iconColor }]}>
          Actual size shown after processing
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 16 },
  qualityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: { fontSize: 15, fontWeight: '500' },
  value: { fontSize: 15, fontWeight: '600' },
  presets: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  presetButton: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
  },
  presetText: { fontSize: 13, fontWeight: '600' },
  sizeInfo: {
    gap: 8,
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(128,128,128,0.06)',
  },
  sizeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sizeLabel: { fontSize: 14 },
  sizeValue: { fontSize: 14, fontWeight: '500' },
  note: { fontSize: 12, textAlign: 'center', fontStyle: 'italic' },
});
