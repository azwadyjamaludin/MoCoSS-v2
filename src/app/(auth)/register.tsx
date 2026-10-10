import { Href, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage } from '../../context/LanguageContext';

export default function RegisterScreen() {
  const router = useRouter();
  const { lang, toggleLanguage } = useLanguage();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [matrixNo, setMatrixNo] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'supervisor' | 'supervisee'>('supervisee');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    // Basic Form Validation
    if (!fullName || !email || !password || !confirmPassword) {
      Alert.alert(
        lang === 'BM' ? 'Ralat' : 'Error',
        lang === 'BM' ? 'Sila isi semua ruangan yang diperlukan.' : 'Please fill in all required fields.'
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(
        lang === 'BM' ? 'Ralat' : 'Error',
        lang === 'BM' ? 'Kata laluan tidak sepadan.' : 'Passwords do not match.'
      );
      return;
    }

    setIsLoading(true);

    try {
      // Save credentials and auto-login
      const userData = {
        fullName,
        email,
        matrixNo,
        role,
      };

      await SecureStore.setItemAsync('userToken', 'dummy-register-token-123');
      await SecureStore.setItemAsync('userData', JSON.stringify(userData));

      Alert.alert(
        lang === 'BM' ? 'Berjaya' : 'Success',
        lang === 'BM' ? 'Pendaftaran berjaya!' : 'Registration successful!',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/' as Href),
          },
        ]
      );
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert(
        lang === 'BM' ? 'Ralat' : 'Error',
        lang === 'BM' ? 'Gagal mendaftar. Sila cuba lagi.' : 'Registration failed. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header Bar */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.langToggle} onPress={toggleLanguage} activeOpacity={0.8}>
              <Text style={styles.langText}>{lang === 'BM' ? '🌐 BM' : '🌐 EN'}</Text>
            </TouchableOpacity>
          </View>

          {/* Title Section */}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>MoCoSS</Text>
            <Text style={styles.subtitle}>
              {lang === 'BM' ? 'Daftar Akaun Baharu' : 'Create New Account'}
            </Text>
          </View>

          {/* Registration Form Card */}
          <View style={styles.card}>
            {/* Full Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{lang === 'BM' ? 'Nama Penuh' : 'Full Name'}</Text>
              <TextInput
                style={styles.input}
                placeholder={lang === 'BM' ? 'Masukkan nama penuh' : 'Enter full name'}
                placeholderTextColor="#64748B"
                value={fullName}
                onChangeText={setFullName}
              />
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{lang === 'BM' ? 'Alamat E-mel' : 'Email Address'}</Text>
              <TextInput
                style={styles.input}
                placeholder="supervisor@mocoss.my"
                placeholderTextColor="#64748B"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            {/* Matrix / Staff ID */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{lang === 'BM' ? 'No. Matrik / Staf' : 'Matrix / Staff ID'}</Text>
              <TextInput
                style={styles.input}
                placeholder="E.g. D2026101234"
                placeholderTextColor="#64748B"
                autoCapitalize="characters"
                value={matrixNo}
                onChangeText={setMatrixNo}
              />
            </View>

            {/* Role Selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{lang === 'BM' ? 'Peranan' : 'Role'}</Text>
              <View style={styles.roleContainer}>
                <TouchableOpacity
                  style={[styles.roleOption, role === 'supervisee' && styles.roleOptionActive]}
                  onPress={() => setRole('supervisee')}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.roleText, role === 'supervisee' && styles.roleTextActive]}>
                    {lang === 'BM' ? 'Penyeliaan' : 'Supervisee'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.roleOption, role === 'supervisor' && styles.roleOptionActive]}
                  onPress={() => setRole('supervisor')}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.roleText, role === 'supervisor' && styles.roleTextActive]}>
                    {lang === 'BM' ? 'Penyelia' : 'Supervisor'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{lang === 'BM' ? 'Kata Laluan' : 'Password'}</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#64748B"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            {/* Confirm Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                {lang === 'BM' ? 'Sahkan Kata Laluan' : 'Confirm Password'}
              </Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#64748B"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.registerButton, isLoading && { opacity: 0.7 }]}
              onPress={handleRegister}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <Text style={styles.registerButtonText}>
                {isLoading
                  ? lang === 'BM'
                    ? 'Memproses...'
                    : 'Processing...'
                  : lang === 'BM'
                  ? 'Daftar Akaun'
                  : 'Register Account'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Footer - Link back to Login */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              {lang === 'BM' ? 'Sudah mempunyai akaun?' : 'Already have an account?'}
            </Text>
            <TouchableOpacity onPress={() => router.replace('/login' as Href)}>
              <Text style={styles.loginLink}>{lang === 'BM' ? ' Log Masuk' : ' Sign In'}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F19',
  },
  scrollContent: {
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  langToggle: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  langText: {
    color: '#38BDF8',
    fontWeight: 'bold',
    fontSize: 13,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#38BDF8',
  },
  subtitle: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94A3B8',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#1E293B',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#334155',
  },
  roleContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  roleOption: {
    flex: 1,
    backgroundColor: '#1E293B',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  roleOptionActive: {
    backgroundColor: '#0284C7',
    borderColor: '#38BDF8',
  },
  roleText: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '600',
  },
  roleTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  registerButton: {
    backgroundColor: '#0284C7',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  footerText: {
    color: '#64748B',
    fontSize: 14,
  },
  loginLink: {
    color: '#38BDF8',
    fontSize: 14,
    fontWeight: 'bold',
  },
});