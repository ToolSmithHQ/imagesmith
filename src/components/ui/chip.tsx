import { Text, StyleSheet } from 'react-native';
import { ImpactFeedbackStyle } from 'expo-haptics';
import { triggerImpact } from '@/src/utils/haptics';
import { AnimatedPressable } from '@/src/components/ui/animated-pressable';
import { Typography, Radius } from '@/src/constants/theme';

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
    triggerImpact(ImpactFeedbackStyle.Light);
    onPress?.();
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      disabled={disabled || !onPress}
      scaleValue={0.95}
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
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: Radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    ...Typography.labelLarge,
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.4,
  },
});
