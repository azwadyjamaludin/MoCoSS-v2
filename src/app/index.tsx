import { Href, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import MoCoSSSplashScreen from '../components/MoCoSSSplashScreen';
import DashboardScreen from '../screens/DashboardScreen';

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
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error checking authentication state:', error);
      setIsAuthenticated(false);
    }
  };

  const handleSplashFinish = () => {
    setShowSplash(false);
    if (!isAuthenticated) {
      router.replace('/login' as Href);
    }
  };

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync('userToken');
    await SecureStore.deleteItemAsync('userData');
    setIsAuthenticated(false);
    setUser(null);
    router.replace('/login' as Href);
  };

  if (showSplash) {
    return <MoCoSSSplashScreen onFinish={handleSplashFinish} />;
  }

  return <DashboardScreen user={user} onLogout={handleLogout} />;
}