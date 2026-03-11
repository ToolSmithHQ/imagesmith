import { ScrollView, Text, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ToolGrid } from '@/src/components/tool-grid';
import { useThemeColor } from '@/src/hooks/use-theme-color';
import { Typography, Spacing } from '@/src/constants/theme';

export default function HomeScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const onSurfaceVariant = useThemeColor({}, 'onSurfaceVariant');

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
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
  toolsSection: {
    gap: Spacing.md,
  },
  sectionLabel: {
    ...Typography.labelMedium,
    textTransform: 'uppercase',
  },
});
