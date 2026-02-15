import { View, StyleSheet } from 'react-native';
import { ToolCard } from '@/src/components/tool-card';
import { TOOLS } from '@/src/constants/tools';

export function ToolGrid() {
  const rows: (typeof TOOLS)[] = [];
  for (let i = 0; i < TOOLS.length; i += 2) {
    rows.push(TOOLS.slice(i, i + 2));
  }

  return (
    <View style={styles.container}>
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
          {row.length === 1 && <View style={styles.placeholder} />}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  placeholder: {
    flex: 1,
  },
});
