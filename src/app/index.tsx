import { Href, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useState } from 'react';
import MoCoSSSplashScreen from '../components/MoCoSSSplashScreen';
import { switchDashboard } from '../context/AuthContext';

export default function HomeScreen() {
  const router = useRouter();
  const [showSplash, setShowSplash] = useState<boolean>(true);
  

  
  const handleSplashFinish = async() => {
    setShowSplash(false);
    try {
      const token = await SecureStore.getItemAsync('userToken');
      const storedUserData = await SecureStore.getItemAsync('userData');

      if (token && storedUserData) {
        const role = JSON.parse(storedUserData)?.role;
        router.replace(switchDashboard(role) ?? ('/(auth)/login' as Href));
      }else {
        router.replace('/(auth)/login' as Href);
      }
    }catch (error) {
      console.error('Error checking authentication state:', error);
      router.replace('/(auth)/login')
    }
  };

  if (showSplash) {
    return <MoCoSSSplashScreen onFinish={handleSplashFinish} />;
  }

  return null;
}