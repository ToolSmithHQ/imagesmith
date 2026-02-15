import { View, Text, StyleSheet } from 'react-native';
import { Chip } from '@/src/components/ui/chip';
import { FORMAT_DISPLAY } from '@/src/constants/formats';
import { ImageFormat } from '@/src/types/formats';
import { getAvailableTargets } from '@/src/utils/conversion-matrix';
import { useThemeColor } from '@/hooks/use-theme-color';

interface FormatPickerProps {
  sourceFormat: ImageFormat;
  selectedTarget: ImageFormat | null;
  onSelectTarget: (format: ImageFormat) => void;
}

export function FormatPicker({
  sourceFormat,
  selectedTarget,
  onSelectTarget,
}: FormatPickerProps) {
  const textColor = useThemeColor({}, 'text');
  const iconColor = useThemeColor({}, 'icon');
  const availableTargets = getAvailableTargets(sourceFormat);
  const sourceDisplay = FORMAT_DISPLAY[sourceFormat];

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={[styles.label, { color: iconColor }]}>Source</Text>
        <Chip
          label={sourceDisplay.label}
          color={sourceDisplay.color}
          selected
        />
      </View>

      <View style={styles.section}>
        <Text style={[styles.label, { color: iconColor }]}>Convert to</Text>
        <View style={styles.chips}>
          {availableTargets.map((format) => {
            const display = FORMAT_DISPLAY[format];
            return (
              <Chip
                key={format}
                label={display.label}
                color={display.color}
                selected={selectedTarget === format}
                onPress={() => onSelectTarget(format)}
              />
            );
          })}
        </View>
        {availableTargets.length === 0 && (
          <Text style={[styles.noTargets, { color: textColor }]}>
            No conversions available for this format on your device.
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 20,
  },
  section: {
    gap: 10,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  noTargets: {
    fontSize: 14,
    fontStyle: 'italic',
  },
});
