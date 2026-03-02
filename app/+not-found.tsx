import { Text, View, StyleSheet } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/src/components/ui/button';
import { useThemeColor } from '@/src/hooks/use-theme-color';

export default function NotFoundScreen() {
  const router = useRouter();
  const textColor = useThemeColor({}, 'text');
  const iconColor = useThemeColor({}, 'icon');
  const backgroundColor = useThemeColor({}, 'background');

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor }]}>
      <Stack.Screen options={{ title: 'Not Found' }} />
      <View style={styles.container}>
        <Text style={[styles.title, { color: textColor }]}>Page Not Found</Text>
        <Text style={[styles.message, { color: iconColor }]}>
          This screen doesn't exist.
        </Text>
        <Button
          variant="primary"
          title="Go Home"
          onPress={() => router.replace('/')}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  message: {
    fontSize: 16,
    marginBottom: 12,
  },
});
