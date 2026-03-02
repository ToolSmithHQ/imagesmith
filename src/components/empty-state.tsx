import { View, Text, StyleSheet } from 'react-native';
import { IconSymbol } from '@/src/components/ui/icon-symbol';
import { useThemeColor } from '@/src/hooks/use-theme-color';
import { Typography, Spacing } from '@/src/constants/theme';

interface EmptyStateProps {
  icon: string;
  title: string;
  message: string;
}

export function EmptyState({ icon, title, message }: EmptyStateProps) {
  const textColor = useThemeColor({}, 'text');
  const onSurfaceVariant = useThemeColor({}, 'onSurfaceVariant');
  const surfaceContainer = useThemeColor({}, 'surfaceContainer');

  return (
    <View style={styles.container}>
      <View style={[styles.iconCircle, { backgroundColor: surfaceContainer }]}>
        <IconSymbol name={icon as any} size={32} color={onSurfaceVariant} />
      </View>
      <Text style={[styles.title, { color: textColor }]}>{title}</Text>
      <Text style={[styles.message, { color: onSurfaceVariant }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    padding: Spacing.xxxl,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  title: {
    ...Typography.titleLarge,
    textAlign: 'center',
  },
  message: {
    ...Typography.bodyMedium,
    textAlign: 'center',
  },
});
