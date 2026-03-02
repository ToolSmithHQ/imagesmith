import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { useThemeColor } from '@/src/hooks/use-theme-color';
import { IconSymbol } from '@/src/components/ui/icon-symbol';
import { triggerImpact } from '@/src/utils/haptics';

interface ResizeConfigProps {
  sourceWidth: number;
  sourceHeight: number;
  width: number;
  height: number;
  lockAspectRatio: boolean;
  onWidthChange: (w: number) => void;
  onHeightChange: (h: number) => void;
  onToggleLock: () => void;
}

const PRESETS = [
  { label: '25%', factor: 0.25 },
  { label: '50%', factor: 0.5 },
  { label: '75%', factor: 0.75 },
  { label: '150%', factor: 1.5 },
  { label: '200%', factor: 2.0 },
];

export function ResizeConfig({
  sourceWidth,
  sourceHeight,
  width,
  height,
  lockAspectRatio,
  onWidthChange,
  onHeightChange,
  onToggleLock,
}: ResizeConfigProps) {
  const textColor = useThemeColor({}, 'text');
  const iconColor = useThemeColor({}, 'icon');
  const tint = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({}, 'border');

  const aspectRatio = sourceWidth / sourceHeight;

  const handleWidthChange = (text: string) => {
    const w = parseInt(text, 10) || 0;
    onWidthChange(w);
    if (lockAspectRatio && w > 0) {
      onHeightChange(Math.round(w / aspectRatio));
    }
  };

  const handleHeightChange = (text: string) => {
    const h = parseInt(text, 10) || 0;
    onHeightChange(h);
    if (lockAspectRatio && h > 0) {
      onWidthChange(Math.round(h * aspectRatio));
    }
  };

  const applyPreset = (factor: number) => {
    triggerImpact();
    const w = Math.round(sourceWidth * factor);
    const h = Math.round(sourceHeight * factor);
    onWidthChange(w);
    onHeightChange(h);
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputRow}>
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: iconColor }]}>Width</Text>
          <TextInput
            style={[styles.input, { color: textColor, borderColor }]}
            value={String(width)}
            onChangeText={handleWidthChange}
            keyboardType="number-pad"
            selectTextOnFocus
          />
        </View>

        <Pressable
          onPress={() => {
            triggerImpact();
            onToggleLock();
          }}
          style={styles.lockButton}
        >
          <IconSymbol
            name={lockAspectRatio ? 'lock.fill' : 'lock.open'}
            size={20}
            color={lockAspectRatio ? tint : iconColor}
          />
        </Pressable>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: iconColor }]}>Height</Text>
          <TextInput
            style={[styles.input, { color: textColor, borderColor }]}
            value={String(height)}
            onChangeText={handleHeightChange}
            keyboardType="number-pad"
            selectTextOnFocus
          />
        </View>
      </View>

      <Text style={[styles.info, { color: iconColor }]}>
        Original: {sourceWidth} x {sourceHeight} → New: {width} x {height}
      </Text>

      <View style={styles.presets}>
        {PRESETS.map((preset) => (
          <Pressable
            key={preset.label}
            onPress={() => applyPreset(preset.factor)}
            style={[styles.presetButton, { borderColor }]}
          >
            <Text style={[styles.presetText, { color: tint }]}>
              {preset.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 16 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  inputGroup: { flex: 1, gap: 4 },
  label: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1.5,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  lockButton: {
    padding: 8,
    marginBottom: 8,
  },
  info: { fontSize: 13, textAlign: 'center' },
  presets: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  presetButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  presetText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
