import { Text, View, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { triggerImpact } from '@/src/utils/haptics';
import { IconSymbol } from '@/src/components/ui/icon-symbol';
import { AnimatedPressable } from '@/src/components/ui/animated-pressable';
import { useThemeColor } from '@/src/hooks/use-theme-color';
import { ToolDefinition } from '@/src/constants/tools';
import { Typography, Spacing, Radius } from '@/src/constants/theme';

interface ToolCardProps {
  tool: ToolDefinition;
}

export function ToolCard({ tool }: ToolCardProps) {
  const router = useRouter();
  const tint = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');
  const onSurfaceVariant = useThemeColor({}, 'onSurfaceVariant');

  const glassBg = useThemeColor(
    { light: 'rgba(255,255,255,0.35)', dark: 'rgba(30,30,40,0.45)' },
    'surfaceContainer',
  );

  const androidBg = useThemeColor(
    { light: '#FFFFFF', dark: '#1E1E28' },
    'surfaceContainer',
  );

  const handlePress = () => {
    if (!tool.enabled) return;
    triggerImpact();
    router.push(tool.route as any);
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      disabled={!tool.enabled}
      testID={`tool-${tool.id}`}
      style={[styles.card, !tool.enabled && styles.disabled]}
    >
      {Platform.OS === 'ios' ? (
        <BlurView
          intensity={70}
          tint="default"
          style={StyleSheet.absoluteFillObject}
        >
          <View
            style={[
              StyleSheet.absoluteFillObject,
              {
                backgroundColor: glassBg,
                borderRadius: Radius.xl,
                borderWidth: 0.5,
                borderColor: 'rgba(150,150,150,0.18)',
              },
            ]}
          />
        </BlurView>
      ) : (
        <View
          style={[
            StyleSheet.absoluteFillObject,
            {
              backgroundColor: androidBg,
              borderRadius: Radius.xl,
              borderWidth: 0.5,
              borderColor: 'rgba(150,150,150,0.18)',
            },
          ]}
        />
      )}

      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: `${tint}15` }]}>
          <IconSymbol name={tool.icon as any} size={28} color={tint} />
        </View>

        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: textColor }]} numberOfLines={1}>
            {tool.title}
          </Text>
          <Text style={[styles.description, { color: onSurfaceVariant }]} numberOfLines={2}>
            {tool.description}
          </Text>
        </View>

        {!tool.enabled && (
          <View style={[styles.badge, { backgroundColor: `${onSurfaceVariant}20` }]}>
            <Text style={[styles.badgeText, { color: onSurfaceVariant }]}>Soon</Text>
          </View>
        )}
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(150,150,150,0.18)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  content: {
    padding: Spacing.xl,
    gap: Spacing.lg,
    zIndex: 1,
  },
  disabled: {
    opacity: 0.45,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: Radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    gap: 6,
  },
  title: {
    ...Typography.titleMedium,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  description: {
    ...Typography.bodySmall,
    lineHeight: 20,
    opacity: 0.85,
  },
  badge: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(150,150,150,0.2)',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
});
