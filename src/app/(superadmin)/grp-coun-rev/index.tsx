import Header from '@/components/Header';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { translations } from '@/context/localization';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const API_URL = `${process.env.EXPO_PUBLIC_API_URL}/api/grpCoun`;

export default function IndCounReviewScreen() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { lang } = useLanguage();
  const {checkAuthToken} = useAuth();
  const router = useRouter();

  useEffect(() => {
     async function getSessionsData() {
      try {
        const res = await fetch(`${API_URL}/sessions/`, { method: 'GET', headers: { 'Authorization': `Bearer ${checkAuthToken()}` } }); 
        const data = await res.json();
        setSessions(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching sessions:', err);
        setLoading(false);
      }
    }

    getSessionsData();
  }, []);

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
        data={sessions}
        keyExtractor={(item: any) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.sessionCard}>
            <Text style={styles.sessionTitle}>{item.title}</Text>
            <Text style={styles.clientCode}>Client ID: {item.client_identifier || 'Anonymized'}</Text>
            <Text style={styles.transcriptSnippet} numberOfLines={3}>
              Transcript: {item.transcript || 'No transcript available.'}
            </Text>
            
            <TouchableOpacity style={styles.button} onPress={() => router.push({ pathname: '/ind-coun-rev/[id]', params: { id: item.id } })}>
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