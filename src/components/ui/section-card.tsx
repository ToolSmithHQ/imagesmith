import { View, Text, StyleSheet } from 'react-native';
import { useThemeColor } from '@/src/hooks/use-theme-color';
import { Typography, Spacing, Radius } from '@/src/constants/theme';
import React from 'react';

interface SectionCardProps {
  title?: string;
  children: React.ReactNode;
}

export function SectionCard({ title, children }: SectionCardProps) {
  const surfaceContainer = useThemeColor({}, 'surfaceContainer');
  const onSurfaceVariant = useThemeColor({}, 'onSurfaceVariant');
  const outlineVariant = useThemeColor({}, 'outlineVariant');

  const childArray = React.Children.toArray(children).filter(Boolean);

  return (
    <View style={[styles.container, { backgroundColor: surfaceContainer }]}>
      {title && (
        <Text
          style={[
            styles.title,
            { color: onSurfaceVariant },
          ]}
        >
          {title}
        </Text>
      )}
      {childArray.map((child, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <View style={[styles.divider, { backgroundColor: outlineVariant }]} />
          )}
          {child}
        </React.Fragment>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  title: {
    ...Typography.labelMedium,
    textTransform: 'uppercase',
    marginBottom: Spacing.xs,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
});
