import { Stack } from 'expo-router';
import { LanguageProvider } from '../../context/LanguageContext';

export default function ModuleLayout() {
  return (
    <LanguageProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="dashboard" />
        <Stack.Screen name="ind-coun" />
        <Stack.Screen name="grp-coun" />
        <Stack.Screen name="log-book/index" />
        <Stack.Screen name="log-book/[id]" />
        <Stack.Screen name="case-anal/index" />
        <Stack.Screen name="case-anal/[id]" />
        <Stack.Screen name="ref-cons/index" />
        <Stack.Screen name="ref-cons/[id]" />
      </Stack>
    </LanguageProvider>
  );
}