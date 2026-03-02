import { Stack } from 'expo-router';

export default function CompressLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ title: 'Compress', headerBackTitle: 'Home' }}
      />
      <Stack.Screen
        name="processing"
        options={{ title: 'Compressing...', headerShown: false, gestureEnabled: false }}
      />
      <Stack.Screen
        name="result"
        options={{ title: 'Result', headerBackTitle: 'Back' }}
      />
    </Stack>
  );
}
