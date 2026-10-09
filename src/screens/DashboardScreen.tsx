import { Ionicons } from '@expo/vector-icons';
import { Href, useRouter } from 'expo-router';
import {
    Alert,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Language, useLanguage } from '../context/LanguageContext';

interface ModuleItem {
  id: string;
  title: Record<Language, string>;
  description: Record<Language, string>;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  route: string;
}

interface DashboardScreenProps {
  user: { fullName: string; role: string } | null;
  onLogout: () => void;
}

export default function DashboardScreen({ user, onLogout }: DashboardScreenProps) {
  const router = useRouter();
  const { lang, toggleLanguage } = useLanguage();

  const handleLogoutClick = () => {
    Alert.alert(
      lang === 'BM' ? 'Log keluar?' : 'Log out?',
      lang === 'BM' ? 'Adakah anda pasti untuk log keluar?' : 'Are you sure you want to log out?',
      [
        { text: lang === 'BM' ? 'Batal' : 'Cancel', style: 'cancel' },
        { text: lang === 'BM' ? 'Ya' : 'Yes', style: 'destructive', onPress: onLogout },
      ]
    );
  };

  // ContentActivity.kt module array mapping
  const modules: ModuleItem[] = [
    {
      id: 'ind_coun',
      title: { BM: 'Kaunseling Individu', EN: 'Individual Counseling' },
      description: { BM: 'Pengurusan sesi kaunseling individu', EN: 'Individual counseling session management' },
      icon: 'person-outline',
      color: '#2563EB',
      route: '/ind-coun',
    },
    {
      id: 'grp_coun',
      title: { BM: 'Kaunseling Kelompok', EN: 'Group Counseling' },
      description: { BM: 'Pengurusan sesi kelompok & peserta', EN: 'Group session & participant management' },
      icon: 'people-outline',
      color: '#0D9488',
      route: '/grp-coun',
    },
    {
      id: 'log_book',
      title: { BM: 'Buku Log', EN: 'Log Book' },
      description: { BM: 'Rekod dan log penyeliaan harian', EN: 'Daily supervision logbook' },
      icon: 'journal-outline',
      color: '#D97706',
      route: '/log-book',
    },
    {
      id: 'case_anal',
      title: { BM: 'Analisis Kes', EN: 'Case Analysis' },
      description: { BM: 'Penilaian dan laporan analisis kes', EN: 'Case analysis evaluation & reports' },
      icon: 'analytics-outline',
      color: '#7C3AED',
      route: '/case-anal',
    },
    {
      id: 'ref_cons',
      title: { BM: 'Konsultasi & Rujukan', EN: 'Reflective Consultation' },
      description: { BM: 'Konsultasi reflektif & kes rujukan', EN: 'Reflective consultation & referrals' },
      icon: 'git-network-outline',
      color: '#DC2626',
      route: '/ref-cons',
    },
    {
      id: 'reflect',
      title: { BM: 'Refleksi Kendiri', EN: 'Self Reflection' },
      description: { BM: 'Catatan refleksi penyeliaan', EN: 'Supervision reflection notes' },
      icon: 'chatbubble-ellipses-outline',
      color: '#E11D48',
      route: '/reflect',
    },
    {
      id: 'psy_edu',
      title: { BM: 'Psikoedukasi', EN: 'Psychology Education' },
      description: { BM: 'Bahan modul & program psikoedukasi', EN: 'Psychoeducation modules & materials' },
      icon: 'book-outline',
      color: '#059669',
      route: '/psy-edu',
    },
    {
      id: 'psy_test',
      title: { BM: 'Ujian Psikologi', EN: 'Psychology Test' },
      description: { BM: 'Inventori & alat pentaksiran', EN: 'Psychological assessment tools' },
      icon: 'clipboard-outline',
      color: '#4F46E5',
      route: '/psy-test',
    },
    {
      id: 'prof_dev',
      title: { BM: 'Pembangunan Profesional', EN: 'Professional Dev' },
      description: { BM: 'Latihan & kompetensi profesional', EN: 'Training & professional competence' },
      icon: 'ribbon-outline',
      color: '#0891B2',
      route: '/prof-dev',
    },
    {
      id: 'full_mark',
      title: { BM: 'Markah Penuh', EN: 'Full Mark Evaluation' },
      description: { BM: 'Rubrik gred & penilaian akhir', EN: 'Grading rubrics & final marks' },
      icon: 'star-outline',
      color: '#CA8A04',
      route: '/full-mark',
    },
    {
      id: 'adm_mgt',
      title: { BM: 'Pengurusan Admin', EN: 'Admin Management' },
      description: { BM: 'Tetapan sistem & pentadbiran', EN: 'Admin control & system settings' },
      icon: 'settings-outline',
      color: '#475569',
      route: '/adm-mgt',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>MoCoSS-v2</Text>
          <Text style={styles.subtitle}>
            {lang === 'BM' ? 'Sistem Penyeliaan Kaunseling' : 'Counselling Supervision System'}
          </Text>
        </View>

        {/* Global Language Toggle */}
        <TouchableOpacity style={styles.langToggle} onPress={toggleLanguage} activeOpacity={0.8}>
          <Ionicons name="globe-outline" size={16} color="#38BDF8" />
          <Text style={styles.langText}>{lang === 'BM' ? 'BM' : 'EN'}</Text>
        </TouchableOpacity>
      </View>

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

        {/* Modules Grid */}
        <View style={styles.grid}>
          {modules.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.card}
              activeOpacity={0.7}
              onPress={() => router.push(item.route as Href)}
            >
              <View style={[styles.iconContainer, { backgroundColor: item.color + '18' }]}>
                <Ionicons name={item.icon} size={24} color={item.color} />
              </View>
              <Text style={styles.cardTitle}>{item.title[lang]}</Text>
              <Text style={styles.cardDescription} numberOfLines={2}>
                {item.description[lang]}
              </Text>
            </TouchableOpacity>
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
  container: {
    flex: 1,
    backgroundColor: '#0B0F19',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#38BDF8',
  },
  subtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  langToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: '#334155',
  },
  langText: {
    color: '#38BDF8',
    fontWeight: 'bold',
    fontSize: 13,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  welcomeCard: {
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F8FAFC',
  },
  roleText: {
    fontSize: 13,
    color: '#38BDF8',
    marginTop: 2,
    textTransform: 'capitalize',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: cardWidth,
    backgroundColor: '#111827',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 15,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  logoutButtonText: {
    color: '#EF4444',
    fontSize: 15,
    fontWeight: 'bold',
  },
});