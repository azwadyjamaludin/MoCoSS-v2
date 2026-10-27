import { Stack } from 'expo-router';
import { LanguageProvider } from '../../context/LanguageContext';

export default function ModuleLayout() {
  return (
    <LanguageProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="dashboard" />
        <Stack.Screen name="ind-coun" />
        <Stack.Screen name="grp-coun" />
        <Stack.Screen name="log-book" />
      </Stack>
    </LanguageProvider>
  );
}