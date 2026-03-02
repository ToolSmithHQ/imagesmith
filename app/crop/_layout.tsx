import { Stack } from 'expo-router';

export default function CropLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ title: 'Crop', headerBackTitle: 'Home' }}
      />
      <Stack.Screen
        name="processing"
        options={{ title: 'Processing...', headerShown: false, gestureEnabled: false }}
      />
      <Stack.Screen
        name="result"
        options={{ title: 'Result', headerBackTitle: 'Back' }}
      />
    </Stack>
  );
}
