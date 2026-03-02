import { Stack } from 'expo-router';

export default function EditorLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Editor', headerBackTitle: 'Home' }} />
    </Stack>
  );
}
