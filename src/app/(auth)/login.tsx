import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { translations } from '@/context/localization';
import { tryTestLogin } from '@/data/mock/mock-auth';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// Adjust this URL to point to MoCoSS backend (e.g., http://localhost:8000 or your server IP)
const AUTH_API_URL = `${process.env.EXPO_PUBLIC_API_URL}/api/auth/login`;

export default function LoginScreen() {
  const { lang, toggleLanguage } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth()

  const handleStandardLogin = async () => {
    if (!email || !password) {
      Alert.alert('Validation Error', 'Please enter both email and password.');
      return;
    }

    setIsLoading(true);

    try {
      let ok: boolean;
      let data: any;

      const testLogin =tryTestLogin(email, password)
      if (testLogin) {
        ok = true;
        data = testLogin;
      } else {
      const response = await fetch(AUTH_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      ok = response.ok
      data = await response.json();
      
      if (ok) {
        await login(data.user,data.token);
      } else {
        Alert.alert('Authentication Failed', data.error || 'Invalid credentials.');
      }
      }
    } catch (error) {
      console.error('Login network error:', error);
      Alert.alert('Network Error', 'Unable to connect to authentication server.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMyDigitalIDLogin = () => {
    Alert.alert(
      'MyDigital ID Integration',
      'MyDigital ID authentication pipeline is ready and will be connected in an upcoming update.'
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableOpacity style={styles.langToggle} onPress={toggleLanguage} activeOpacity={0.8}>
          <Ionicons name="globe-outline" size={18} color="#38BDF8" />
        <Text style={styles.langText}>{lang === 'BM' ? 'BM | EN' : 'EN | BM'}</Text>
      </TouchableOpacity>
    <View style={styles.card}>
        <Text style={styles.brandTitle}>MoCoSS</Text>
        <Text style={styles.brandSubtitle}>{translations[lang].brandSubtitle}
        </Text>
     
        {/* Input Fields */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>{translations[lang].emailAddress}</Text>
          <TextInput
            style={styles.input}
            placeholder="supervisor@mocoss.my"
            placeholderTextColor="#475569"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{translations[lang].password}</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor="#475569"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleStandardLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.loginButtonText}>{translations[lang].login}</Text>
          )}
        </TouchableOpacity>

        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>{translations[lang].or}</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Future MyDigital ID Option */}
        <TouchableOpacity style={styles.myDigitalIdButton} onPress={handleMyDigitalIDLogin}>
          <Text style={styles.myDigitalIdText}>{translations[lang].signinWithMyDigitalID}</Text>
        </TouchableOpacity>

        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} /></View>
           <Link style={styles.registerText} href="/register">
            {translations[lang].noAccount} {translations[lang].signUp}
          </Link>
        </View>
   </KeyboardAvoidingView>
  
  );
}

const styles = StyleSheet.create({
  container: {flex: 1,backgroundColor: '#0B0F19',justifyContent: 'center',alignItems: 'center',padding: 24,},
  card: {width: '100%',maxWidth: 400,backgroundColor: '#111827',borderRadius: 20,padding: 28,borderWidth: 1,borderColor: '#1F2937',},
  brandTitle: {fontSize: 32,fontWeight: 'bold',color: '#38BDF8',textAlign: 'center',letterSpacing: 2,},
  brandSubtitle: {fontSize: 13,color: '#94A3B8',textAlign: 'center',marginBottom: 32,marginTop: 4,},
  langToggle: {flexDirection: 'row',alignItems: 'center',backgroundColor: '#334155',paddingHorizontal: 12,paddingVertical: 8,borderRadius: 20,gap: 6,borderWidth: 1,borderColor: '#475569',},
  langText: {color: '#FFFFFF',fontSize: 12,fontWeight: 'bold',},
  inputGroup: {marginBottom: 20,},
  label: {color: '#CBD5E1',fontSize: 13,fontWeight: '600',marginBottom: 8,},
  input: {backgroundColor: '#1E293B',borderRadius: 12,paddingHorizontal: 16,paddingVertical: 14,color: '#F8FAFC',fontSize: 15,borderWidth: 1,borderColor: '#334155',},
  loginButton: {backgroundColor: '#0284C7',paddingVertical: 16,borderRadius: 12,alignItems: 'center',marginTop: 12,},
  loginButtonText: {color: '#FFFFFF',fontSize: 16,fontWeight: 'bold',},
  dividerContainer: {flexDirection: 'row',alignItems: 'center',marginVertical: 24,},
  dividerLine: {flex: 1,height: 1,backgroundColor: '#1E293B',},
  dividerText: {color: '#64748B',paddingHorizontal: 12,fontSize: 12,fontWeight: 'bold',},
  registerText: {color: '#FFFFFF',fontSize: 16,fontWeight: 'bold',},
  myDigitalIdButton: {backgroundColor: 'transparent',borderWidth: 1.5,borderColor: '#38BDF8',paddingVertical: 14,borderRadius: 12,alignItems: 'center',},
  myDigitalIdText: {color: '#38BDF8',fontSize: 15,fontWeight: '600',},
});