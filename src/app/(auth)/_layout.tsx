import { LanguageProvider } from '@/context/LanguageContext';
import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <LanguageProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" />
      <Stack.Screen name="register" />
    </Stack>
    </LanguageProvider>
  );
}