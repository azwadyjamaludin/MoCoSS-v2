import * as SecureStore from 'expo-secure-store';
import React, { createContext, useContext, useEffect, useState } from 'react';

export type Language = 'BM' | 'EN';

interface LanguageContextType {
  lang: Language;
  toggleLanguage: () => void;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Language>('BM');

  useEffect(() => {
    // Load saved language preference on app launch
    const loadLanguage = async () => {
      try {
        const savedLang = await SecureStore.getItemAsync('appLanguage');
        if (savedLang === 'BM' || savedLang === 'EN') {
          setLang(savedLang);
        }
      } catch (error) {
        console.error('Error loading language preference:', error);
      }
    };
    loadLanguage();
  }, []);

  const setLanguage = async (newLang: Language) => {
    setLang(newLang);
    try {
      await SecureStore.setItemAsync('appLanguage', newLang);
    } catch (error) {
      console.error('Error saving language preference:', error);
    }
  };

  const toggleLanguage = () => {
    const nextLang = lang === 'BM' ? 'EN' : 'BM';
    setLanguage(nextLang);
  };

  return (
    <LanguageContext.Provider value={{ lang, toggleLanguage, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};