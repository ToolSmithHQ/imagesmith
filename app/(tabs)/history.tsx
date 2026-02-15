import { FlatList, Text, View, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useHistoryStore } from '@/src/stores/use-history-store';
import { EmptyState } from '@/src/components/empty-state';
import { Chip } from '@/src/components/ui/chip';
import { FORMAT_DISPLAY } from '@/src/constants/formats';
import { ConversionResult } from '@/src/types/image';
import { useThemeColor } from '@/hooks/use-theme-color';

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function HistoryItem({ item }: { item: ConversionResult }) {
  const iconColor = useThemeColor({}, 'icon');
  const surfaceColor = useThemeColor({}, 'background');
  const sourceDisplay = FORMAT_DISPLAY[item.source.format];
  const outputDisplay = FORMAT_DISPLAY[item.output.format];

  return (
    <View style={[styles.item, { backgroundColor: surfaceColor }]}>
      <Image
        source={{ uri: item.output.uri }}
        style={styles.thumbnail}
        contentFit="cover"
      />
      <View style={styles.itemInfo}>
        <View style={styles.formatRow}>
          <Chip label={sourceDisplay.label} color={sourceDisplay.color} />
          <Text style={[styles.arrow, { color: iconColor }]}> → </Text>
          <Chip label={outputDisplay.label} color={outputDisplay.color} />
        </View>
        <Text style={[styles.itemMeta, { color: iconColor }]}>
          {formatFileSize(item.source.fileSize)} →{' '}
          {formatFileSize(item.output.fileSize)}
        </Text>
        <Text style={[styles.itemDate, { color: iconColor }]}>
          {formatDate(item.timestamp)}
        </Text>
      </View>
    </View>
  );
}

export default function HistoryScreen() {
  const { conversions, clearHistory } = useHistoryStore();
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: textColor }]}>History</Text>
        {conversions.length > 0 && (
          <Pressable onPress={clearHistory}>
            <Text style={styles.clear}>Clear All</Text>
          </Pressable>
        )}
      </View>
      <FlatList
        data={conversions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <HistoryItem item={item} />}
        contentContainerStyle={
          conversions.length === 0 ? styles.emptyContainer : styles.list
        }
        ListEmptyComponent={
          <EmptyState
            icon="clock"
            title="No conversions yet"
            message="Your conversion history will appear here."
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
  },
  clear: {
    fontSize: 15,
    color: '#FF3B30',
  },
  list: {
    padding: 20,
    gap: 12,
  },
  emptyContainer: {
    flex: 1,
  },
  item: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  thumbnail: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: 'rgba(128,128,128,0.1)',
  },
  itemInfo: {
    flex: 1,
    justifyContent: 'center',
    gap: 4,
  },
  formatRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  arrow: {
    fontSize: 14,
    fontWeight: '500',
  },
  itemMeta: {
    fontSize: 12,
  },
  itemDate: {
    fontSize: 11,
  },
});
