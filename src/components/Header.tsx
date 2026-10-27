import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLanguage } from '../context/LanguageContext';

interface HeaderProps {
  subtitle:string
}

export default function Header({subtitle}:HeaderProps) {
    const router = useRouter();
  const { lang, toggleLanguage } = useLanguage();

  return (
    <View style={styles.header}>
      <View>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                  <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>
        <Text style={styles.appTitle}>MoCoSS</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>

      <TouchableOpacity style={styles.langToggle} onPress={toggleLanguage} activeOpacity={0.8}>
        <Ionicons name="globe-outline" size={18} color="#38BDF8" />
        <Text style={styles.langText}>{lang === 'BM' ? 'BM | EN' : 'EN | BM'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {backgroundColor: '#1E293B',paddingHorizontal: 20,paddingTop: 16,paddingBottom: 20,flexDirection: 'row',justifyContent: 'space-between',alignItems: 'center',},
  appTitle: {fontSize: 22,fontWeight: 'bold',color: '#FFFFFF',},
  subtitle: {fontSize: 12,color: '#94A3B8',marginTop: 2,},
  langToggle: {flexDirection: 'row',alignItems: 'center',backgroundColor: '#334155',paddingHorizontal: 12,paddingVertical: 8,borderRadius: 20,gap: 6,borderWidth: 1,borderColor: '#475569',},
  langText: {color: '#FFFFFF',fontWeight: '700',fontSize: 12,},
  backButton: { marginRight: 15 },
});