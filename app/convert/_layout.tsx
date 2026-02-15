import { Stack } from 'expo-router';

export default function ConvertLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ title: 'Convert', headerBackTitle: 'Home' }}
      />
      <Stack.Screen
        name="processing"
        options={{ title: 'Converting...', headerShown: false, gestureEnabled: false }}
      />
      <Stack.Screen
        name="result"
        options={{ title: 'Result', headerBackTitle: 'Back' }}
      />
    </Stack>
  );
}
