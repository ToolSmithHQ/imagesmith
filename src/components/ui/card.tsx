import { View, StyleSheet, ViewProps } from 'react-native';
import { useThemeColor } from '@/src/hooks/use-theme-color';
import { Radius, Spacing, Elevation } from '@/src/constants/theme';

type CardVariant = 'elevated' | 'filled' | 'outlined';

interface CardProps extends ViewProps {
  variant?: CardVariant;
  children: React.ReactNode;
}

export function Card({ variant = 'elevated', children, style, ...props }: CardProps) {
  const surfaceContainer = useThemeColor({}, 'surfaceContainer');
  const outline = useThemeColor({}, 'outline');

  const variantStyle =
    variant === 'elevated'
      ? [{ backgroundColor: surfaceContainer }, Elevation.level2]
      : variant === 'filled'
        ? { backgroundColor: surfaceContainer }
        : { backgroundColor: 'transparent', borderWidth: 1, borderColor: outline };

  return (
    <View
      style={[styles.card, variantStyle, style]}
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    padding: Spacing.lg,
  },
});
