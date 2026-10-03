import { useState } from 'react';
import { Alert, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Set this to your Python backend URL (e.g., http://localhost:8000 or your Codespaces URL)
const PYTHON_BACKEND_URL = 'http://localhost:8000/api/upload-audio';

export default function HomeScreen() {
  const [status, setStatus] = useState<string>('Ready to connect to Python backend');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  /**
   * Example function to test connection with Python FastAPI/Flask backend
   */
  const testBackendConnection = async () => {
    setIsProcessing(true);
    setStatus('Connecting to Python server...');

    try {
      const response = await fetch('http://localhost:8000/');
      const data = await response.json();
      
      setStatus(`Connected! Server Status: ${data.status}`);
      Alert.alert('Backend Success', JSON.stringify(data));
    } catch (error) {
      console.error('Connection failed:', error);
      setStatus('Failed to connect to Python backend.');
      Alert.alert('Error', 'Could not reach Python server on port 8000.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>MoCoSS v2</Text>
        <Text style={styles.subtitle}>Counseling Supervision Interface</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.statusLabel}>Backend Connection Status:</Text>
        <Text style={styles.statusText}>{status}</Text>

        <TouchableOpacity
          style={styles.button}
          onPress={testBackendConnection}
          disabled={isProcessing}
        >
          <Text style={styles.buttonText}>
            {isProcessing ? 'Testing...' : 'Test Python Backend'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#38BDF8',
  },
  subtitle: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 4,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  statusLabel: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 16,
    color: '#F8FAFC',
    textAlign: 'center',
    marginBottom: 32,
  },
  button: {
    backgroundColor: '#0284C7',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 24,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});