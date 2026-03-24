import { Text, ActivityIndicator, StyleSheet, ViewStyle } from 'react-native';
import { useThemeColor } from '@/src/hooks/use-theme-color';
import { triggerImpact } from '@/src/utils/haptics';
import { AnimatedPressable } from '@/src/components/ui/animated-pressable';
import { Typography, Radius } from '@/src/constants/theme';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

interface ButtonProps {
  variant?: ButtonVariant;
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  testID?: string;
}

export function Button({
  variant = 'primary',
  title,
  onPress,
  loading = false,
  disabled = false,
  testID,
}: ButtonProps) {
  const tint = useThemeColor({}, 'tint');
  const background = useThemeColor({}, 'background');
  const surfaceContainerHigh = useThemeColor({}, 'surfaceContainerHigh');

  const handlePress = () => {
    if (disabled || loading) return;
    triggerImpact();
    onPress();
  };

  const containerStyle: ViewStyle =
    variant === 'primary'
      ? { backgroundColor: tint }
      : variant === 'secondary'
        ? { backgroundColor: surfaceContainerHigh, borderWidth: 1.5, borderColor: tint }
        : { backgroundColor: 'transparent' };

  const textColor = variant === 'primary' ? background : tint;

  return (
    <AnimatedPressable
      onPress={handlePress}
      disabled={disabled || loading}
      testID={testID ?? `btn-${title.toLowerCase().replace(/\s+/g, '-')}`}
      style={[
        styles.container,
        containerStyle,
        disabled && styles.disabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? background : tint}
        />
      ) : (
        <Text style={[styles.text, { color: textColor }]}>{title}</Text>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  text: {
    ...Typography.titleMedium,
  },
  disabled: {
    opacity: 0.5,
  },
});
