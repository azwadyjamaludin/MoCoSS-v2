import { useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';

import { DarkTheme, DefaultTheme, Href, Slot, ThemeProvider, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { LanguageProvider } from '@/context/LanguageContext';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Check authentication token from storage
    const checkToken = async () => {
      setIsLoading(false);
    };
    checkToken();
  }, []);

  useEffect(() => {
    if (isLoading) return;
    const firstSegment = segments[0] as string | undefined;
    const inAuthGroup = firstSegment === '(auth)';
    //const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/login' as Href);
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/(app)' as Href);
    }
  }, [isAuthenticated, segments, isLoading]);

  return (
    <LanguageProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AnimatedSplashOverlay />
        <Slot />
      </ThemeProvider>
    </LanguageProvider>
  );
}