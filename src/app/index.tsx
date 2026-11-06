import { Href, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useState } from 'react';
import MoCoSSSplashScreen from '../components/MoCoSSSplashScreen';

export default function HomeScreen() {
  const router = useRouter();
  const [showSplash, setShowSplash] = useState<boolean>(true);
  

  
  const handleSplashFinish = async() => {
    setShowSplash(false);
    try {
      const token = await SecureStore.getItemAsync('userToken');
      const storedUserData = await SecureStore.getItemAsync('userData');

      if (token && storedUserData) {
        const userData = JSON.parse(storedUserData);
        if (userData.role === 'superadmin') {
          router.replace('/(superadmin)/dashboard' as Href);
        } else if (userData.role === 'supervisor') {
          router.replace('/(supervisor)/dashboard' as Href);
        } else if (userData.role === 'counselor') {
          router.replace('/(counselor)/dashboard' as Href);
        } else if (userData.role === 'admin') {
          router.replace('/(admin)/dashboard' as Href);
        }
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