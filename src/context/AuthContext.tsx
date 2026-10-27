// src/context/AuthContext.tsx
import { Href, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface User {
  fullName: string;
  role: string;
  email?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (userData: User, token: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuthToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedUserData = await SecureStore.getItemAsync('userData');
      if (storedUserData) {
        setUser(JSON.parse(storedUserData));
      }
    } catch (e) {
      console.error('Failed to load auth state:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const checkAuthToken = async () => {
    try {
      await SecureStore.getItemAsync('userToken');
    } catch (error) {
      console.error('Error checking authentication state:', error);
      router.replace('/(auth)/login' as Href);
    }
  };  

  const login = async (userData: User, token: string) => {
    await SecureStore.setItemAsync('userToken', token);
    await SecureStore.setItemAsync('userData', JSON.stringify(userData));
    setUser(userData);
    router.replace('/(modules)/dashboard' as Href);
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync('userToken');
    await SecureStore.deleteItemAsync('userData');
    await SecureStore.deleteItemAsync('lastRoute');

    setUser(null);
    router.replace('/(auth)/login' as Href);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, checkAuthToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}