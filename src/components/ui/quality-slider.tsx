import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { useThemeColor } from '@/src/hooks/use-theme-color';
import { Typography, Spacing } from '@/src/constants/theme';

interface QualitySliderProps {
  value: number;
  onValueChange: (v: number) => void;
  min?: number;
  max?: number;
  label?: string;
}

export function QualitySlider({
  value,
  onValueChange,
  min = 0.5,
  max = 1,
  label = 'Output Quality',
}: QualitySliderProps) {
  const textColor = useThemeColor({}, 'text');
  const tint = useThemeColor({}, 'tint');
  const surfaceContainerHigh = useThemeColor({}, 'surfaceContainerHigh');

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={[styles.label, { color: textColor }]}>{label}</Text>
        <Text style={[styles.value, { color: tint }]}>
          {Math.round(value * 100)}%
        </Text>
      </View>
      <Slider
        minimumValue={min}
        maximumValue={max}
        value={value}
        onValueChange={onValueChange}
        minimumTrackTintColor={tint}
        maximumTrackTintColor={surfaceContainerHigh}
        step={0.05}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    ...Typography.bodyMedium,
  },
  value: {
    ...Typography.titleMedium,
  },
});
