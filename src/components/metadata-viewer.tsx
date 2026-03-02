import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { ExifData } from '@/src/types/image';
import { useThemeColor } from '@/src/hooks/use-theme-color';
import { Button } from '@/src/components/ui/button';

interface MetadataViewerProps {
  exifData: ExifData | null;
  loading: boolean;
  error: string | null;
  onStripMetadata: () => void;
}

export function MetadataViewer({
  exifData,
  loading,
  error,
  onStripMetadata,
}: MetadataViewerProps) {
  const textColor = useThemeColor({}, 'text');
  const iconColor = useThemeColor({}, 'icon');
  const tint = useThemeColor({}, 'tint');
  const errorColor = useThemeColor({}, 'error');
  const borderColor = useThemeColor({}, 'border');

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={tint} />
        <Text style={[styles.loadingText, { color: iconColor }]}>
          Reading metadata...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={[styles.errorText, { color: errorColor }]}>{error}</Text>
      </View>
    );
  }

  if (!exifData) return null;

  const categories = Object.keys(exifData);
  const hasData = categories.some(
    (cat) => Object.keys(exifData[cat]).length > 0,
  );

  return (
    <View style={styles.container}>
      {!hasData ? (
        <View style={styles.centered}>
          <Text style={[styles.emptyText, { color: iconColor }]}>
            No metadata found in this image.
          </Text>
        </View>
      ) : (
        <>
          {categories.map((category) => {
            const entries = Object.entries(exifData[category]).filter(
              ([, v]) => v != null,
            );
            if (entries.length === 0) return null;

            return (
              <View key={category} style={styles.section}>
                <Text style={[styles.sectionTitle, { color: tint }]}>
                  {category}
                </Text>
                {entries.map(([key, value]) => (
                  <View
                    key={key}
                    style={[styles.row, { borderBottomColor: borderColor }]}
                  >
                    <Text
                      style={[styles.key, { color: iconColor }]}
                      numberOfLines={1}
                    >
                      {key}
                    </Text>
                    <Text
                      style={[styles.value, { color: textColor }]}
                      numberOfLines={2}
                    >
                      {String(value)}
                    </Text>
                  </View>
                ))}
              </View>
            );
          })}

          <Button
            variant="secondary"
            title="Strip All Metadata"
            onPress={onStripMetadata}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 20 },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 12,
  },
  loadingText: { fontSize: 15 },
  errorText: { fontSize: 15 },
  emptyText: { fontSize: 15, textAlign: 'center' },
  section: { gap: 8 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  key: { fontSize: 13, flex: 1 },
  value: { fontSize: 13, fontWeight: '500', flex: 1, textAlign: 'right' },
});
