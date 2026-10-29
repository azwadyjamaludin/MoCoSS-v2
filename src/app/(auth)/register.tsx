import { useAuth } from '@/context/AuthContext';
import { translations } from '@/context/localization';
import { Href, useRouter } from 'expo-router';
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
import Header from '../../components/Header';
import { useLanguage } from '../../context/LanguageContext';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function RegisterScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const { lang, toggleLanguage } = useLanguage();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [matrixNo, setMatrixNo] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'supervisor' |'counselor' | 'field supervisor' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  // True once the ID was found in the FSK registry (name/email/role are then locked)
  const [verified, setVerified] = useState(false);

  const handleRegister = async () => {
    if (!verified || !matrixNo || !password || !confirmPassword) {
      Alert.alert(
        translations[lang].error,
        translations[lang].requiredFields
      );
      return;
    }

    if (password.length < 8) {
      Alert.alert(
        translations[lang].error,
        lang === 'BM'
          ? 'Kata laluan mesti sekurang-kurangnya 8 aksara.'
          : 'Password must be at least 8 characters.'
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(
        translations[lang].error,
        translations[lang].passwordMismatch
      );
      return;
    }

    setIsLoading(true);

    try {
      // Name, email and role are taken from the FSK registry on the server.
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: matrixNo.trim(), password }),
      });
      const data = await response.json();

      if (response.ok) {
        // Stores the real JWT + user and routes to the dashboard
        await login(data.user, data.token);
      } else {
        Alert.alert(
          translations[lang].error,
          typeof data.detail === 'string' ? data.detail : translations[lang].registrationFailed
        );
      }
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert(
        translations[lang].error,
        translations[lang].registrationFailed
      );
    } finally {
      setIsLoading(false);
    }
  };

  const clearLookup = () => {
    setVerified(false);
    setFullName('');
    setEmail('');
    setRole(null);
  };

  const handleIdLookup = async () => {
    const id = matrixNo.trim();
    if (!id) {
      clearLookup();
      return;
    }

    try {
      // Backend checks the FSK UPSI registry
      const response = await fetch(`${API_URL}/api/auth/lookup?id=${encodeURIComponent(id)}`);
      const data = await response.json();

      if (response.ok) {
        setFullName(data.fullName);
        setRole(data.role);
        setEmail(data.email);
        setVerified(true);
      } else {
        clearLookup();
        Alert.alert(
          translations[lang].error,
          response.status === 404
            ? lang === 'BM' ? 'ID tidak dijumpai dalam pangkalan data FSK.' : 'ID not found in FSK database.'
            : response.status === 409
              ? lang === 'BM' ? 'ID ini telah didaftarkan.' : 'This ID is already registered.'
              : translations[lang].registrationFailed
        );
      }
    } catch (error) {
      console.error('ID lookup error:', error);
      clearLookup();
      Alert.alert(
        translations[lang].error,
        lang === 'BM' ? 'Tidak dapat menyambung ke pelayan.' : 'Unable to connect to the server.'
      );
    }
  };


  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
         <Header subtitle={translations[lang].register}/>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Registration Form Card */}
          <View style={styles.card}>
            {/* Matric / Staff ID - looked up in the FSK registry */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{translations[lang].matID}</Text>
              <TextInput
                style={styles.input}
                placeholder={lang === 'BM' ? 'Masukkan No. Matrik / Staff ID' : 'Enter Matric / Staff ID'}
                placeholderTextColor="#64748B"
                autoCapitalize="characters"
                autoCorrect={false}
                value={matrixNo}
                onChangeText={(t) => {
                  setMatrixNo(t);
                  if (verified) clearLookup();
                }}
                onBlur={handleIdLookup}
              />
            </View>
            {/* Full Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{translations[lang].fullName}</Text>
              <TextInput
                style={styles.input}
                placeholder={translations[lang].enterFullName}
                placeholderTextColor="#64748B"
                value={fullName}
                editable={false}
              />
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{translations[lang].emailAddress}</Text>
              <TextInput
                style={styles.input}
                placeholder="supervisor@mocoss.my"
                placeholderTextColor="#64748B"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                editable={false}
              />
            </View>

            {/* Role Selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{lang === 'BM' ? 'Peranan' : 'Role'}</Text>
              <View style={styles.roleContainer}>
                <View
                  style={[styles.roleOption, role === 'counselor' && styles.roleOptionActive]}
                >
                  <Text style={[styles.roleText, role === 'counselor' && styles.roleTextActive]}>
                    {lang === 'BM' ? 'Kaunselor' : 'Counselor'}
                  </Text>
                </View>
                <View
                  style={[styles.roleOption, role === 'field supervisor' && styles.roleOptionActive]}
                >
                  <Text style={[styles.roleText, role === 'field supervisor' && styles.roleTextActive]}>
                    {lang === 'BM' ? 'Penyelia Lapangan' : 'Field Supervisor'}
                  </Text>
                </View>
                <View
                  style={[styles.roleOption, role === 'supervisor' && styles.roleOptionActive]}
                >
                  <Text style={[styles.roleText, role === 'supervisor' && styles.roleTextActive]}>
                    {lang === 'BM' ? 'Penyelia' : 'Supervisor'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{translations[lang].password}</Text>
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
                  ? translations[lang].processing
                  : translations[lang].register}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Footer - Link back to Login */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              {translations[lang].alreadyHaveAccount}
            </Text>
            <TouchableOpacity onPress={() => router.push('/login' as Href)}>
              <Text style={styles.loginLink}>{translations[lang].login}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1,backgroundColor: '#0B0F19',},
  scrollContent: {padding: 24,justifyContent: 'center',},
  header: {alignItems: 'flex-end',marginBottom: 12,},
  langToggle: {backgroundColor: '#1E293B',paddingHorizontal: 12,paddingVertical: 6,borderRadius: 20,borderWidth: 1,borderColor: '#334155',},
  langText: {color: '#38BDF8',fontWeight: 'bold',fontSize: 13,},
  titleContainer: {alignItems: 'center',marginBottom: 24,},
  title: {fontSize: 32,fontWeight: 'bold',color: '#38BDF8',},
  subtitle: {fontSize: 14,color: '#94A3B8',marginTop: 4,},
  card: {backgroundColor: '#111827',borderRadius: 16,padding: 20,borderWidth: 1,borderColor: '#1E293B',},
  inputGroup: {marginBottom: 16,},
  label: {fontSize: 13,fontWeight: '600',color: '#94A3B8',marginBottom: 6,},
  input: {backgroundColor: '#1E293B',borderRadius: 10,paddingHorizontal: 14,paddingVertical: 12,fontSize: 14,color: '#F8FAFC',borderWidth: 1,borderColor: '#334155',},
  roleContainer: {flexDirection: 'row',gap: 10,},
  roleOption: {flex: 1,backgroundColor: '#1E293B',paddingVertical: 10,borderRadius: 10,alignItems: 'center',borderWidth: 1,borderColor: '#334155',},
  roleOptionActive: {backgroundColor: '#0284C7',borderColor: '#38BDF8',},
  roleText: {fontSize: 13,color: '#94A3B8',fontWeight: '600',},
  roleTextActive: {color: '#FFFFFF',fontWeight: '700',},
  registerButton: {backgroundColor: '#0284C7',paddingVertical: 14,borderRadius: 12,alignItems: 'center',marginTop: 8,},
  registerButtonText: {color: '#FFFFFF',fontSize: 15,fontWeight: 'bold',},
  footer: {flexDirection: 'row',justifyContent: 'center',alignItems: 'center',marginTop: 24,},
  footerText: {color: '#64748B',fontSize: 14,},
  loginLink: {color: '#38BDF8',fontSize: 14,fontWeight: 'bold',},
});