import { ScrollView, Text, View, Switch, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSettingsStore } from '@/src/stores/use-settings-store';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function SettingsScreen() {
  const textColor = useThemeColor({}, 'text');
  const iconColor = useThemeColor({}, 'icon');
  const tint = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');

  const {
    defaultJpegQuality,
    preserveExifByDefault,
    hapticFeedback,
    setDefaultJpegQuality,
    setPreserveExifByDefault,
    setHapticFeedback,
  } = useSettingsStore();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: textColor }]}>Settings</Text>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: iconColor }]}>
            CONVERSION DEFAULTS
          </Text>

          <View style={styles.option}>
            <View style={styles.optionHeader}>
              <Text style={[styles.label, { color: textColor }]}>
                JPEG Quality
              </Text>
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
              maximumTrackTintColor={`${iconColor}40`}
              step={0.05}
            />
          </View>

          <View style={styles.row}>
            <Text style={[styles.label, { color: textColor }]}>
              Preserve Metadata by Default
            </Text>
            <Switch
              value={preserveExifByDefault}
              onValueChange={setPreserveExifByDefault}
              trackColor={{ true: tint }}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: iconColor }]}>
            GENERAL
          </Text>

          <View style={styles.row}>
            <Text style={[styles.label, { color: textColor }]}>
              Haptic Feedback
            </Text>
            <Switch
              value={hapticFeedback}
              onValueChange={setHapticFeedback}
              trackColor={{ true: tint }}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: iconColor }]}>ABOUT</Text>
          <Text style={[styles.aboutText, { color: iconColor }]}>
            Image Smith v1.0.0
          </Text>
          <Text style={[styles.aboutText, { color: iconColor }]}>
            Privacy-friendly image tools. All processing happens on your device.
          </Text>
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
    padding: 20,
    paddingTop: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 24,
  },
  section: {
    marginBottom: 32,
    gap: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  option: {
    gap: 8,
  },
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  aboutText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
