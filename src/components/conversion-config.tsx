import { View, Text, Switch, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { ImageFormat } from '@/src/types/formats';
import { FORMAT_DISPLAY } from '@/src/constants/formats';
import { useThemeColor } from '@/hooks/use-theme-color';

interface ConversionConfigProps {
  targetFormat: ImageFormat;
  quality: number;
  preserveExif: boolean;
  onQualityChange: (quality: number) => void;
  onPreserveExifChange: (preserve: boolean) => void;
}

export function ConversionConfig({
  targetFormat,
  quality,
  preserveExif,
  onQualityChange,
  onPreserveExifChange,
}: ConversionConfigProps) {
  const textColor = useThemeColor({}, 'text');
  const iconColor = useThemeColor({}, 'icon');
  const tint = useThemeColor({}, 'tint');
  const isLossy = FORMAT_DISPLAY[targetFormat].lossy;

  return (
    <View style={styles.container}>
      {isLossy && (
        <View style={styles.option}>
          <View style={styles.optionHeader}>
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
        </View>
      )}

      <View style={styles.row}>
        <View style={styles.rowText}>
          <Text style={[styles.label, { color: textColor }]}>
            Preserve Metadata
          </Text>
          <Text style={[styles.hint, { color: iconColor }]}>
            Keep EXIF data (camera, location, date)
          </Text>
        </View>
        <Switch
          value={preserveExif}
          onValueChange={onPreserveExifChange}
          trackColor={{ true: tint }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 20,
  },
  option: {
    gap: 8,
  },
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 15,
    fontWeight: '500',
  },
  value: {
    fontSize: 15,
    fontWeight: '600',
  },
  hint: {
    fontSize: 12,
    marginTop: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowText: {
    flex: 1,
    marginRight: 12,
  },
});
