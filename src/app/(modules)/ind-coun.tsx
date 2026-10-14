import { useAuth } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { CameraView, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useRef, useState } from 'react';
import { Alert, Button, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useLanguage } from '../../context/LanguageContext';
import { translations } from '../../context/localization';

export default function IndividualCounselingScreen() {
  const router = useRouter();
  const { user } = useAuth();
  //const params = useLocalSearchParams<{ superviseeId?: string }>();
  const { lang } = useLanguage();

  const cameraRef = useRef<CameraView | null>(null);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [microphonePermission, requestMicrophonePermission] = useMicrophonePermissions();
  
  // Session timer states
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [recordedVideoUri, setRecordedVideoUri] = useState<string | null>(null);
  
  // Audio recording states
  const recordingRef = useRef<Audio.Recording | null>(null);
  const [isAudioRecording, setIsAudioRecording] = useState(false);
  const [recordedAudioUri, setRecordedAudioUri] = useState<string | null>(null);

  // Form states
  const [clientStatus, setClientStatus] = useState('');
  const [sessionNotes, setSessionNotes] = useState('');

  // Request permissions on load if missing
  useEffect(() => {
    if (!cameraPermission?.granted) requestCameraPermission();
    if (!microphonePermission?.granted) requestMicrophonePermission();

    // Request audio permission for expo-av
    Audio.requestPermissionsAsync();
  }, [cameraPermission, microphonePermission]);
  
  // Handle live timer loop
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isSessionActive) {
      interval = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
    } else if (!isSessionActive && secondsElapsed !== 0) {
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSessionActive]);

  // Format seconds into HH:MM:SS
  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const handleToggleSession = async () => {
    if (!isSessionActive) {
      // Start session & recording check
      if (!cameraRef.current) {
        Alert.alert('Error', 'Camera reference is not ready.');
        return;
      }

      try {
        setIsSessionActive(true);
        setSecondsElapsed(0);
        
        // Starts recording and stores output to a cache URI once stopped
        const videoRecordPromise = cameraRef.current.recordAsync();
        const data = await videoRecordPromise;
        if (data?.uri) {
          setRecordedVideoUri(data.uri);
        }
      } catch (error) {
        console.error('Failed to record video:', error);
        setIsSessionActive(false);
        Alert.alert('Error', 'Could not record video session.');
      }
    } else {
      // End session confirmation
      Alert.alert(translations[lang].endSession, translations[lang].endSessionConfirmation, [
        { text: translations[lang].cancel || 'Cancel', style: 'cancel' },
        { 
          text: 'Yes, End', 
          onPress: async () => {
            if (cameraRef.current) {
              cameraRef.current.stopRecording();
            }
            setIsSessionActive(false);
          } 
        }
      ]);
    }
  };

  const handleToggleAudioRecording = async () => {
    if (!isAudioRecording) {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });

        setIsAudioRecording(true);
        setSecondsElapsed(0);

        const { recording } = await Audio.Recording.createAsync(
          Audio.RecordingOptionsPresets.HIGH_QUALITY
        );
        recordingRef.current = recording;
      } catch (error) {
        console.error('Failed to start audio recording:', error);
        setIsAudioRecording(false);
        Alert.alert('Error', 'Could not start audio recording.');
      }
    } else {
      try {
        setIsAudioRecording(false);
        if (recordingRef.current) {
          await recordingRef.current.stopAndUnloadAsync();
          const uri = recordingRef.current.getURI();
          if (uri) setRecordedAudioUri(uri);
          recordingRef.current = null;
        }
      } catch (error) {
        console.error('Failed to stop audio recording:', error);
      }
    }
  };
  const handleSaveRecord = async () => {
    if (isSessionActive) {
      Alert.alert(translations[lang].activeSession, translations[lang].saveRecordDesc);
      return;
    }

    if (secondsElapsed === 0) {
      Alert.alert(translations[lang].error, translations[lang].noRecord);
      return;
    }

    const calculatedHours = (secondsElapsed / 3600).toFixed(2);

    try {
      // 1. Retrieve the secure auth token
      const token = await SecureStore.getItemAsync('userToken');
      if (!token) {
        Alert.alert(translations[lang].sessionExpired, translations[lang].loginAgain);
        router.replace('/(auth)/login');
        return;
      }

      // 2. Build the FormData payload
      const formData = new FormData();
      formData.append('durationHours', calculatedHours);
      formData.append('clientStatus', clientStatus);
      formData.append('sessionNotes', sessionNotes);

      // Attach video file if it exists in cache
      if (recordedVideoUri) {
        // Extract filename from URI
        const filename = recordedVideoUri.split('/').pop() || 'indCoun-session.mp4';
        
        // Append file object structure required by React Native FormData
        formData.append('video', {
          uri: recordedVideoUri,
          name: filename,
          type: 'video/mp4',
        } as any);
      }

       // Attach audio file if it exists in cache
      if (recordedAudioUri) {
        // Extract filename from URI
        const filename = recordedAudioUri.split('/').pop() || 'indCoun-session.mp3';
        
        // Append file object structure required by React Native FormData
        formData.append('audio', {
          uri: recordedAudioUri,
          name: filename,
          type: 'audio/mp3',
        } as any);
      }
          

      // 4. Send request to backend
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/indCoun/sessions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,//React Native will automatically generate the correct multipart boundary.
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Server responded with an error status.');
      }

      Alert.alert(translations[lang].success, `Session saved! Total duration: ${calculatedHours} hours (${formatTime(secondsElapsed)})`, [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Submission error:', error);
      Alert.alert('Error', 'Failed to upload counseling record and video. Please try again.');
    }
  };

  if (!cameraPermission?.granted || !microphonePermission?.granted) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.permissionText}>{translations[lang].permisionRequired}</Text>
        <Button title="Grant Permissions" onPress={() => { requestCameraPermission(); requestMicrophonePermission(); }} />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{translations[lang].indCounSessionTitle}</Text>
      </View>

      {/* Live Camera & Timer Card */}
      <View style={styles.cameraCard}>
        <CameraView style={styles.cameraPreview} ref={cameraRef} facing="front">
          <View style={styles.overlayContainer}>
            <Text style={styles.timerDisplay}>{formatTime(secondsElapsed)}</Text>
          </View>
        </CameraView>

        <TouchableOpacity 
          style={[styles.timerButton, isSessionActive ? styles.stopButton : styles.startButton]} 
          onPress={handleToggleSession}
        >
          <Ionicons name={isSessionActive ? "stop-circle" : "videocam"} size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.timerButtonText}>
            {isSessionActive ? "End Video Session" : "Start Video Session"}
          </Text>
        </TouchableOpacity>
        
        {recordedVideoUri && <Text style={styles.successUriText}>✓ Video recorded to cache storage</Text>}
      </View>

      {/* Form Fields */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Client Status / Mood Observation</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Stable, Reflective"
          placeholderTextColor="#999"
          value={clientStatus}
          onChangeText={setClientStatus}
          editable={!isSessionActive}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Detailed Session Notes</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Enter notes observed during the consultation..."
          placeholderTextColor="#999"
          multiline
          numberOfLines={5}
          value={sessionNotes}
          onChangeText={setSessionNotes}
        />
      </View>

      {/* Submit Record Button */}
      <TouchableOpacity 
        style={[styles.submitButton, isSessionActive && styles.disabledButton]} 
        onPress={handleSaveRecord}
        disabled={isSessionActive}
      >
        <Text style={styles.submitButtonText}>Save Counseling Record</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#f8f9fa', flexGrow: 1 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  permissionText: { textAlign: 'center', marginBottom: 15, fontSize: 16, color: '#333' },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, marginTop: 10 },
  backButton: { marginRight: 15 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  cameraCard: { backgroundColor: '#fff', borderRadius: 12, padding: 12, alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: '#e0e0e0', elevation: 2 },
  cameraPreview: { width: '100%', height: 240, borderRadius: 8, overflow: 'hidden', justifyContent: 'flex-end', alignItems: 'center', marginBottom: 15 },
  overlayContainer: { backgroundColor: 'rgba(0,0,0,0.6)', width: '100%', paddingVertical: 8, alignItems: 'center' },
  timerDisplay: { fontSize: 28, fontWeight: 'bold', color: '#fff', fontVariant: ['tabular-nums'] },
  timerButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8, width: '100%', justifyContent: 'center' },
  startButton: { backgroundColor: '#28a745' },
  stopButton: { backgroundColor: '#dc3545' },
  timerButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  successUriText: { marginTop: 8, fontSize: 12, color: '#28a745', fontWeight: '500' },
  formGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#444', marginBottom: 6 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 16, color: '#333' },
  textArea: { height: 100, textAlignVertical: 'top' },
  submitButton: { backgroundColor: '#007AFF', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  disabledButton: { backgroundColor: '#cccccc' },
  submitButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});