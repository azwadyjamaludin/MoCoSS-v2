import Header from '@/components/Header';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { translations } from '@/context/localization';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const API_URL = `${process.env.EXPO_PUBLIC_API_URL}/api/indCoun`;

export default function IndCounReviewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [session, setSession] = useState([]);
  const [loading, setLoading] = useState(true);
  const { lang } = useLanguage();
  const {checkAuthToken} = useAuth();
  const [supervisorNotes, setSupervisorNotes] = useState<{ [key: number]: string }>({});

  useEffect(() => {
     async function getSessionDataById() {
      try {
        const res = await fetch(`${API_URL}/sessions/${id}`, { method: 'GET', headers: { 'Authorization': `Bearer ${checkAuthToken()}` } }); 
        const data = await res.json();
        setSession(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching sessions:', err);
        setLoading(false);
      }
    }

    getSessionDataById();
  }, []);

  const handleSaveFeedback = async (sessionId: number) => {
    const feedback = supervisorNotes[sessionId];
    const response = await fetch(`${API_URL}/feedback/${sessionId}`, { method: 'POST', headers: { 'Authorization': `Bearer ${checkAuthToken()}` },body:JSON.stringify(feedback) }); 
    if (!response.ok) {
      throw new Error(`Failed to save feedback. Status: ${response.status}`);
    }
    console.log(`Saving feedback for session ${sessionId}:`, feedback);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header subtitle={translations[lang].indCounSub}/>
       <ScrollView contentContainerStyle={styles.container}>
      <FlatList
        data={session}
        keyExtractor={(item: any) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.sessionCard}>
            <Text style={styles.sessionTitle}>{item.title}</Text>
            <Text style={styles.clientCode}>Client ID: {item.client_identifier || 'Anonymized'}</Text>
            <Text style={styles.transcriptSnippet} numberOfLines={3}>
              Transcript: {item.transcript || 'No transcript available.'}
            </Text>
            
            <TextInput
              style={styles.input}
              placeholder="Add supervisor notes / feedback..."
              value={supervisorNotes[item.id] || ''}
              onChangeText={(text) => setSupervisorNotes({ ...supervisorNotes, [item.id]: text })}
            />
            
            <TouchableOpacity style={styles.button} onPress={() => handleSaveFeedback(item.id)}>
              <Text style={styles.buttonText}>Submit Feedback</Text>
            </TouchableOpacity>
          </View>
        )}
      />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0F19', padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 16, color: '#1C1C1E' },
  sessionCard: {backgroundColor: '#FFF',padding: 16,borderRadius: 10,marginBottom: 12,borderWidth: 1,borderColor: '#E5E5EA',},
  sessionTitle: { fontSize: 16, fontWeight: '600', color: '#000' },
  clientCode: { fontSize: 12, color: '#666', marginBottom: 6 },
  transcriptSnippet: { fontSize: 13, color: '#333', marginBottom: 10, backgroundColor: '#F2F2F7', padding: 8, borderRadius: 6 },
  input: {borderWidth: 1,borderColor: '#C7C7CC',borderRadius: 6,padding: 8,fontSize: 13,marginBottom: 8,backgroundColor: '#FAFAFC',},
  button: { backgroundColor: '#007AFF', padding: 10, borderRadius: 6, alignItems: 'center' },
  buttonText: { color: '#FFF', fontSize: 13, fontWeight: '600' },
});