import { Href, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import MoCoSSSplashScreen from '../components/MoCoSSSplashScreen';

export default function HomeScreen() {
  const router = useRouter();
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<{ fullName: string; role: string } | null>(null);

  useEffect(() => {
    checkAuthToken();
  }, []);

  const checkAuthToken = async () => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      const storedUserData = await SecureStore.getItemAsync('userData');

      if (token && storedUserData) {
        setIsAuthenticated(true);
        setUser(JSON.parse(storedUserData));
        router.replace('/(modules)/dashboard' as Href);
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error checking authentication state:', error);
      setIsAuthenticated(false);
    }
  };

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync('userToken');
    await SecureStore.deleteItemAsync('userData');
    setIsAuthenticated(false);
    setUser(null);
    router.replace('/(auth)/login' as Href);
  };

  const handleSplashFinish = () => {
    setShowSplash(false);
    if (!isAuthenticated) {
      router.replace('/(auth)/login' as Href);
    }
  };

  if (showSplash) {
    return <MoCoSSSplashScreen onFinish={handleSplashFinish} />;
  }

  // If not authenticated, redirect to login
  router.replace('/(auth)/login' as Href);
  return null;
}