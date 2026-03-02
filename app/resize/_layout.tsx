import { Stack } from 'expo-router';

export default function ResizeLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ title: 'Resize', headerBackTitle: 'Home' }}
      />
      <Stack.Screen
        name="processing"
        options={{ title: 'Resizing...', headerShown: false, gestureEnabled: false }}
      />
      <Stack.Screen
        name="result"
        options={{ title: 'Result', headerBackTitle: 'Back' }}
      />
    </Stack>
  );
}
