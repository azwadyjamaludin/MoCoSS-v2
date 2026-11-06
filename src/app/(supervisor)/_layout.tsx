import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LanguageProvider } from '../../context/LanguageContext';

export default function SVLayout() {
  return (
    <LanguageProvider>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="dashboard" />
        <Stack.Screen name="ind-coun-rev/index" />
        <Stack.Screen name="full-mark/index" />
        <Stack.Screen name="full-mark/[id]" />
      </Stack>
    </LanguageProvider>
  );
}