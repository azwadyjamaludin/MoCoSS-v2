// app/(modules)/_layout.tsx
import { Stack } from 'expo-router';

export default function ModuleLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="ind-coun" />
    </Stack>
  );
}