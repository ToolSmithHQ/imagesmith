import { Pressable, Text, View, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import { ToolDefinition } from '@/src/constants/tools';

interface ToolCardProps {
  tool: ToolDefinition;
}

export function ToolCard({ tool }: ToolCardProps) {
  const router = useRouter();
  const tint = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');
  const iconColor = useThemeColor({}, 'icon');
  const background = useThemeColor({}, 'background');

  const handlePress = () => {
    if (!tool.enabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(tool.route as any);
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={!tool.enabled}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: background },
        pressed && styles.pressed,
        !tool.enabled && styles.disabled,
      ]}
    >
      <View style={[styles.iconContainer, { backgroundColor: `${tint}15` }]}>
        <IconSymbol name={tool.icon as any} size={28} color={tint} />
      </View>
      <Text style={[styles.title, { color: textColor }]}>{tool.title}</Text>
      <Text style={[styles.description, { color: iconColor }]}>
        {tool.description}
      </Text>
      {!tool.enabled && (
        <View style={styles.comingSoon}>
          <Text style={[styles.comingSoonText, { color: iconColor }]}>
            Coming Soon
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },
  disabled: {
    opacity: 0.55,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
  },
  comingSoon: {
    marginTop: 4,
  },
  comingSoonText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
