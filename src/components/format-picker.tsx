import { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Chip } from '@/src/components/ui/chip';
import { FORMAT_DISPLAY } from '@/src/constants/formats';
import { ImageFormat } from '@/src/types/formats';
import { getAvailableTargets } from '@/src/utils/conversion-matrix';
import { useThemeColor } from '@/src/hooks/use-theme-color';

interface FormatPickerProps {
  sourceFormat: ImageFormat;
  selectedTarget: ImageFormat | null;
  onSelectTarget: (format: ImageFormat, label?: string) => void;
}

interface TargetEntry {
  key: string;
  format: ImageFormat;
  label: string;
  color: string;
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

  // Track which display key is selected to distinguish JPEG vs JPG alias
  const [activeKey, setActiveKey] = useState<string | null>(null);

  // Build entries with JPG alias after JPEG
  const entries: TargetEntry[] = [];
  for (const format of availableTargets) {
    const display = FORMAT_DISPLAY[format];
    entries.push({ key: format, format, label: display.label, color: display.color });
    if (format === ImageFormat.JPEG) {
      entries.push({ key: 'jpg', format: ImageFormat.JPEG, label: 'JPG', color: display.color });
    }
  }

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
          {entries.map((entry) => {
            const selected = activeKey
              ? activeKey === entry.key
              : selectedTarget === entry.format && entry.key === entry.format;
            return (
              <Chip
                key={entry.key}
                label={entry.label}
                color={entry.color}
                selected={selected}
                onPress={() => {
                  setActiveKey(entry.key);
                  onSelectTarget(entry.format, entry.label);
                }}
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
