import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LanguageProvider } from '../../context/LanguageContext';

export default function ModuleLayout() {
  return (
    <LanguageProvider>
      <StatusBar style="light" />
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
        <Stack.Screen name="reflect/index" />
        <Stack.Screen name="reflect/[id]" />
        <Stack.Screen name="psy-edu/index" />
        <Stack.Screen name="psy-edu/[id]" />
        <Stack.Screen name="prof-dev/index" />
        <Stack.Screen name="prof-dev/[id]" />
        <Stack.Screen name="full-mark/index" />
        <Stack.Screen name="full-mark/[id]" />
        <Stack.Screen name="adm-mgt/index" />
      </Stack>
    </LanguageProvider>
  );
}