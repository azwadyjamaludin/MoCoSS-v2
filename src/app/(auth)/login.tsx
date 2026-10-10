import { Link, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
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
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleStandardLogin = async () => {
    if (!email || !password) {
      Alert.alert('Validation Error', 'Please enter both email and password.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(AUTH_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Save the JWT token securely to local storage
        await SecureStore.setItemAsync('userToken', data.token);
        await SecureStore.setItemAsync('userData', JSON.stringify(data.user));

        Alert.alert('Welcome', `Logged in as ${data.user.fullName}`);
        // Navigate to the app home/dashboard route
        router.replace('/');
      } else {
        Alert.alert('Authentication Failed', data.error || 'Invalid credentials.');
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
      <View style={styles.card}>
        <Text style={styles.brandTitle}>MoCoSS</Text>
        <Text style={styles.brandSubtitle}>Clinical Supervision Platform</Text>

        {/* Input Fields */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email Address</Text>
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
          <Text style={styles.label}>Password</Text>
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
            <Text style={styles.loginButtonText}>Sign In</Text>
          )}
        </TouchableOpacity>

        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Future MyDigital ID Option */}
        <TouchableOpacity style={styles.myDigitalIdButton} onPress={handleMyDigitalIDLogin}>
          <Text style={styles.myDigitalIdText}>Sign in with MyDigital ID</Text>
        </TouchableOpacity>

        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Link href="/register">Register</Link>
        </View>

      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F19',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#111827',
    borderRadius: 20,
    padding: 28,
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  brandTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#38BDF8',
    textAlign: 'center',
    letterSpacing: 2,
  },
  brandSubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 32,
    marginTop: 4,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    color: '#CBD5E1',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#F8FAFC',
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#334155',
  },
  loginButton: {
    backgroundColor: '#0284C7',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#1E293B',
  },
  dividerText: {
    color: '#64748B',
    paddingHorizontal: 12,
    fontSize: 12,
    fontWeight: 'bold',
  },
  myDigitalIdButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#38BDF8',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  myDigitalIdText: {
    color: '#38BDF8',
    fontSize: 15,
    fontWeight: '600',
  },
});