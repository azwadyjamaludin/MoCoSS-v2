import ModuleCard from '@/components/modules/ModuleCard';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { translations } from '@/context/localization';
import { Ionicons } from '@expo/vector-icons';
import { Href, useRouter } from 'expo-router';
import { Alert, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View, } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../components/Header';

interface ModuleItem {
  id: string;
  title: { [key: string]: any };
  description: { [key: string]: any };
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  route: string;
  aiPowered?: boolean;
}

export default function DashboardScreen() {
  const router = useRouter();
  const { lang, toggleLanguage } = useLanguage();
  const {user,logout} = useAuth();

  const handleLogoutClick = () => {
    Alert.alert(
      translations[lang].logoutTitle,
      translations[lang].logoutConfirm,
      [
        { text: lang === 'BM' ? 'Batal' : 'Cancel', style: 'cancel' },
        { text: lang === 'BM' ? 'Ya' : 'Yes', style: 'destructive', onPress: logout },
      ]
    );
  };

  // Module array mapping
  const modules: ModuleItem[] = [
    {id: 'adm_mgt',
      title: { [lang]: translations[lang].admMgtTitle },
      description: { [lang]: translations[lang].admMgtDesc },
      icon: 'settings-outline',
      color: '#475569',
      route: '/adm-mgt',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
     <Header subtitle={translations[lang].dashboard}/> 
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* User Card */}
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeText}>
            {lang === 'BM' ? 'Selamat Datang' : 'Welcome'}, {user?.fullName || 'Supervisor'}!
          </Text>
          <Text style={styles.roleText}>
            {lang === 'BM' ? 'Peranan' : 'Role'}: {user?.role || 'supervisor'}
          </Text>
        </View>

        {/* Modules Card */}
        <View style={styles.grid}>
          {modules.map((item) => (
            <ModuleCard
              key={item.id}
              title={item.title[lang]}
              description={item.description[lang]}
              icon={item.icon}
              color={item.color}
              isAiPowered={item.aiPowered}
              aiBadgeText={lang === 'BM' ? 'AI' : 'AI'}
              onPress={() => router.push(item.route as Href)}
            />
          ))}
        </View>
        
        {/* Sign Out Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogoutClick} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={18} color="#EF4444" />
          <Text style={styles.logoutButtonText}>
            {lang === 'BM' ? 'Log Keluar' : 'Sign Out'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const { width } = Dimensions.get('window');
const cardWidth = (width - 44) / 2;

const styles = StyleSheet.create({
  container: {flex: 1,backgroundColor: '#0B0F19',},
  header: {paddingHorizontal: 20,paddingVertical: 16,flexDirection: 'row',justifyContent: 'space-between',alignItems: 'center',borderBottomWidth: 1,borderBottomColor: '#1E293B',},
  title: {fontSize: 22,fontWeight: 'bold',color: '#38BDF8',},
  subtitle: {fontSize: 12,color: '#94A3B8',marginTop: 2,},
  langToggle: {flexDirection: 'row',alignItems: 'center',backgroundColor: '#1E293B',paddingHorizontal: 12,paddingVertical: 6,borderRadius: 20,gap: 6,borderWidth: 1,borderColor: '#334155',},
  langText: {color: '#38BDF8',fontWeight: 'bold',fontSize: 13,},
  scrollContent: {padding: 16,paddingBottom: 32,},
  welcomeCard: {backgroundColor: '#1E293B',padding: 16,borderRadius: 12,marginBottom: 16,},
  welcomeText: {fontSize: 18,fontWeight: 'bold',color: '#F8FAFC',},
  roleText: {fontSize: 13,color: '#38BDF8',marginTop: 2,textTransform: 'capitalize',},
  grid: {flexDirection: 'row',flexWrap: 'wrap',justifyContent: 'space-between',},
  card: {width: cardWidth,backgroundColor: '#111827',borderRadius: 14,padding: 14,marginBottom: 12,borderWidth: 1,borderColor: '#1E293B',},
  iconContainer: {width: 42,height: 42,borderRadius: 10,justifyContent: 'center',alignItems: 'center',marginBottom: 10,},
  cardTitle: {fontSize: 14,fontWeight: '700',color: '#F8FAFC',marginBottom: 4,},
  cardDescription: {fontSize: 11,color: '#64748B',lineHeight: 15,},
  logoutButton: {flexDirection: 'row',alignItems: 'center',justifyContent: 'center',backgroundColor: 'rgba(239, 68, 68, 0.15)',paddingVertical: 14,borderRadius: 12,marginTop: 12,gap: 8,borderWidth: 1,borderColor: 'rgba(239, 68, 68, 0.3)',},
  logoutButtonText: {color: '#EF4444',fontSize: 15,fontWeight: 'bold',},
});