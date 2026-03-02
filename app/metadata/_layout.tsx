import { Stack } from 'expo-router';

export default function MetadataLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ title: 'Metadata', headerBackTitle: 'Home' }}
      />
      <Stack.Screen
        name="processing"
        options={{ title: 'Stripping...', headerShown: false, gestureEnabled: false }}
      />
      <Stack.Screen
        name="result"
        options={{ title: 'Result', headerBackTitle: 'Back' }}
      />
    </Stack>
  );
}
