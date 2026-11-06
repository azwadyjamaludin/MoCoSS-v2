import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function IndCounReviewScreen() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [supervisorNotes, setSupervisorNotes] = useState<{ [key: number]: string }>({});

  useEffect(() => {
    fetch('') // Update with actual endpoint
      .then((res) => res.json())
      .then((data) => {
        setSessions(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching sessions:', err);
        setLoading(false);
      });
  }, []);

  const handleSaveFeedback = (sessionId: number) => {
    const feedback = supervisorNotes[sessionId];
    // Call backend API to save supervisor feedback 
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
    <View style={styles.container}>
      <Text style={styles.title}>Individual Counseling Submissions</Text>
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
    </View>
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