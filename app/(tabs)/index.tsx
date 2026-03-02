import { ScrollView, Text, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ToolGrid } from '@/src/components/tool-grid';
import { useThemeColor } from '@/src/hooks/use-theme-color';
import { Typography, Spacing, Radius } from '@/src/constants/theme';

export default function HomeScreen() {
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  const onSurfaceVariant = useThemeColor({}, 'onSurfaceVariant');
  const tint = useThemeColor({}, 'tint');

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={[styles.brandBar, { backgroundColor: tint }]} />
          <Text style={[styles.title, { color: textColor }]}>Image Smith</Text>
          <Text style={[styles.subtitle, { color: onSurfaceVariant }]}>
            Transform your images
          </Text>
        </View>

        <View style={styles.toolsSection}>
          <Text style={[styles.sectionLabel, { color: onSurfaceVariant }]}>
            TOOLS
          </Text>
          <ToolGrid />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  content: {
    padding: Spacing.xl,
    paddingTop: Spacing.lg,
  },
  header: {
    marginBottom: Spacing.xxl,
    alignItems:"center"
  },
  brandBar: {
    width: 24,
    height: 3,
    borderRadius: Radius.full,
    marginBottom: Spacing.md,
  },
  title: {
    ...Typography.displayLarge,
  },
  subtitle: {
    ...Typography.bodyLarge,
    marginTop: Spacing.xs,
  },
  toolsSection: {
    gap: Spacing.md,
  },
  sectionLabel: {
    ...Typography.labelMedium,
    textTransform: 'uppercase',
  },
});
