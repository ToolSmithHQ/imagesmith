import { View, StyleSheet } from 'react-native';
import { Button } from '@/src/components/ui/button';

interface ResultActionsProps {
  onSave: () => void;
  onShare: () => void;
  onConvertAnother: () => void;
  saving?: boolean;
}

export function ResultActions({
  onSave,
  onShare,
  onConvertAnother,
  saving = false,
}: ResultActionsProps) {
  return (
    <View style={styles.container}>
      <Button
        variant="primary"
        title="Save to Gallery"
        onPress={onSave}
        loading={saving}
      />
      <Button variant="secondary" title="Share" onPress={onShare} />
      <Button
        variant="ghost"
        title="Convert Another"
        onPress={onConvertAnother}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
});
