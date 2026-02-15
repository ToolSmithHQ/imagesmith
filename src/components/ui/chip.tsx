import { Pressable, Text, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';

interface ChipProps {
  label: string;
  color: string;
  selected?: boolean;
  disabled?: boolean;
  onPress?: () => void;
}

export function Chip({
  label,
  color,
  selected = false,
  disabled = false,
  onPress,
}: ChipProps) {
  const handlePress = () => {
    if (disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || !onPress}
      style={[
        styles.chip,
        selected
          ? { backgroundColor: color }
          : { backgroundColor: `${color}20`, borderColor: color, borderWidth: 1 },
        disabled && styles.disabled,
      ]}
    >
      <Text
        style={[styles.label, { color: selected ? '#fff' : color }]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.4,
  },
});
