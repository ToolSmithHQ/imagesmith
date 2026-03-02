import {
  ScrollView,
  Text,
  View,
  Switch,
  Pressable,
  Linking,
  StyleSheet,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import Slider from '@react-native-community/slider';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSettingsStore } from '@/src/stores/use-settings-store';
import { SectionCard } from '@/src/components/ui/section-card';
import { useThemeColor } from '@/src/hooks/use-theme-color';
import { triggerImpact } from '@/src/utils/haptics';
import { Typography, Spacing, Radius } from '@/src/constants/theme';

const THEME_OPTIONS = ['system', 'light', 'dark'] as const;
const THEME_LABELS: Record<string, string> = {
  system: 'System',
  light: 'Light',
  dark: 'Dark',
};

export default function SettingsScreen() {
  const textColor = useThemeColor({}, 'text');
  const tint = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');
  const onSurfaceVariant = useThemeColor({}, 'onSurfaceVariant');
  const surfaceContainerHigh = useThemeColor({}, 'surfaceContainerHigh');
  const tintContainer = useThemeColor({}, 'tintContainer');
  const {
    defaultJpegQuality,
    reEncodingQuality,
    preserveExifByDefault,
    hapticFeedback,
    theme,
    setDefaultJpegQuality,
    setReEncodingQuality,
    setPreserveExifByDefault,
    setHapticFeedback,
    setTheme,
  } = useSettingsStore();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: textColor }]}>Settings</Text>

        <SectionCard title="Conversion Defaults">
          <View style={styles.option}>
            <View style={styles.optionHeader}>
              <Text style={[styles.label, { color: textColor }]}>JPEG Quality</Text>
              <Text style={[styles.value, { color: tint }]}>
                {Math.round(defaultJpegQuality * 100)}%
              </Text>
            </View>
            <Slider
              minimumValue={0.1}
              maximumValue={1}
              value={defaultJpegQuality}
              onValueChange={setDefaultJpegQuality}
              minimumTrackTintColor={tint}
              maximumTrackTintColor={surfaceContainerHigh}
              step={0.05}
            />
          </View>

          <View style={styles.option}>
            <View style={styles.optionHeader}>
              <Text style={[styles.label, { color: textColor }]}>Re-encoding Quality</Text>
              <Text style={[styles.value, { color: tint }]}>
                {Math.round(reEncodingQuality * 100)}%
              </Text>
            </View>
            <Slider
              minimumValue={0.5}
              maximumValue={1}
              value={reEncodingQuality}
              onValueChange={setReEncodingQuality}
              minimumTrackTintColor={tint}
              maximumTrackTintColor={surfaceContainerHigh}
              step={0.05}
            />
            <Text style={[styles.hint, { color: onSurfaceVariant }]}>
              Quality when crop, resize, or rotate re-encodes a JPEG
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={[styles.label, { color: textColor }]}>
              Preserve Metadata
            </Text>
            <Switch
              value={preserveExifByDefault}
              onValueChange={setPreserveExifByDefault}
              trackColor={{ true: tint }}
            />
          </View>
        </SectionCard>

        <SectionCard title="Appearance">
          <View style={styles.themeRow}>
            {THEME_OPTIONS.map((option) => {
              const active = theme === option;
              return (
                <Pressable
                  key={option}
                  onPress={() => {
                    setTheme(option);
                    triggerImpact();
                  }}
                  style={[
                    styles.themeOption,
                    {
                      backgroundColor: active ? tintContainer : surfaceContainerHigh,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.themeLabel,
                      { color: active ? tint : textColor },
                    ]}
                  >
                    {THEME_LABELS[option]}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </SectionCard>

        <SectionCard title="General">
          <View style={styles.row}>
            <Text style={[styles.label, { color: textColor }]}>Haptic Feedback</Text>
            <Switch
              value={hapticFeedback}
              onValueChange={setHapticFeedback}
              trackColor={{ true: tint }}
            />
          </View>
        </SectionCard>

        <SectionCard title="About">
          <Text style={[styles.aboutText, { color: onSurfaceVariant }]}>
            Image Smith v0.0.1
          </Text>
          <Text style={[styles.aboutText, { color: onSurfaceVariant }]}>
            Forged for privacy. Image Smith processes everything locally on your device—no servers, no tracking, no exceptions.
          </Text>
          <View style={styles.socialRow}>
            <Pressable
              style={styles.socialButton}
              onPress={() => Linking.openURL('https://github.com/ToolSmithHQ/imagesmith')}
            >
              <Ionicons name="logo-github" size={22} color={onSurfaceVariant} />
            </Pressable>
            <Pressable
              style={styles.socialButton}
              onPress={() => Linking.openURL('https://x.com/ToolSmithHQ')}
            >
              <Ionicons name="logo-twitter" size={22} color={onSurfaceVariant} />
            </Pressable>
          </View>
        </SectionCard>
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
    gap: Spacing.lg,
  },
  title: {
    ...Typography.displayLarge,
    marginBottom: Spacing.sm,
  },
  option: {
    gap: Spacing.sm,
  },
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    ...Typography.bodyLarge,
  },
  value: {
    ...Typography.titleMedium,
  },
  hint: {
    ...Typography.bodySmall,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  themeRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  themeOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: Radius.sm,
    alignItems: 'center',
  },
  themeLabel: {
    ...Typography.labelLarge,
    fontWeight: '600',
  },
  aboutText: {
    ...Typography.bodyMedium,
  },
  socialRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.xs,
  },
  socialButton: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
