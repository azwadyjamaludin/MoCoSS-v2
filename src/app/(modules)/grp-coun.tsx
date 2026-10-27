import { useAuth } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { AudioModule, RecordingPresets, useAudioRecorder } from 'expo-audio';
import { CameraView, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, Button, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../components/Header';
import { useLanguage } from '../../context/LanguageContext';
import { translations } from '../../context/localization';

export default function GroupCounselingScreen() {
  const router = useRouter();
  const { user, checkAuthToken } = useAuth();
  const { lang } = useLanguage();

  const cameraRef = useRef<CameraView | null>(null);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [microphonePermission, requestMicrophonePermissions] = useMicrophonePermissions();
  
  // Session timer states
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [recordedVideoUri, setRecordedVideoUri] = useState<string | null>(null);
  
  // Audio recording states using modern expo-audio hook
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const [isAudioRecording, setIsAudioRecording] = useState(false);
  const [recordedAudioUri, setRecordedAudioUri] = useState<string | null>(null);

  // Form states
  const [clientStatus, setClientStatus] = useState('');
  const [sessionNotes, setSessionNotes] = useState('');

  // Request permissions on load if missing
  useEffect(() => {
    if (!cameraPermission?.granted) requestCameraPermission();
    if (!microphonePermission?.granted) requestMicrophonePermissions();

    // Request audio permissions natively via expo-audio
    (async () => {
      try {
        await AudioModule.requestRecordingPermissionsAsync();
      } catch (e) {
        console.error('Failed to request audio permissions:', e);
      }
    })();
  }, [cameraPermission, microphonePermission]);
  
  // Handle live timer loop
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isSessionActive || isAudioRecording) {
      interval = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSessionActive, isAudioRecording]);

  // Format seconds into HH:MM:SS
  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const handleToggleSession = async () => {
    if (!isSessionActive) {
      if (!cameraRef.current) {
        Alert.alert('Error', 'Camera reference is not ready.');
        return;
      }

      try {
        setIsSessionActive(true);
        setSecondsElapsed(0);
        
        const data = await cameraRef.current.recordAsync();
        if (data?.uri) {
          setRecordedVideoUri(data.uri);
        }
      } catch (error) {
        console.error('Failed to record video:', error);
        setIsSessionActive(false);
        Alert.alert('Error', 'Could not record video session.');
      }
    } else {
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
        const permission = await AudioModule.requestRecordingPermissionsAsync();
        if (!permission.granted) {
          Alert.alert('Permission denied', 'Microphone permission is required for audio recording.');
          return;
        }

        setIsAudioRecording(true);
        setSecondsElapsed(0);
        
        audioRecorder.record();
      } catch (error) {
        console.error('Failed to start audio recording:', error);
        setIsAudioRecording(false);
        Alert.alert('Error', 'Could not start audio recording.');
      }
    } else {
      try {
        setIsAudioRecording(false);
        await audioRecorder.stop();
        if (audioRecorder.uri) {
          setRecordedAudioUri(audioRecorder.uri);
        }
      } catch (error) {
        console.error('Failed to stop audio recording:', error);
      }
    }
  };

  const handleSaveRecord = async () => {
    if (isSessionActive || isAudioRecording) {
      Alert.alert(translations[lang].activeSession, translations[lang].saveRecordDesc);
      return;
    }

    if (secondsElapsed === 0) {
      Alert.alert(translations[lang].error, translations[lang].noRecord);
      return;
    }

    const calculatedHours = (secondsElapsed / 3600).toFixed(2);

    try {
      const token = checkAuthToken();
      if (!token) {
        Alert.alert(translations[lang].sessionExpired, translations[lang].loginAgain);
        router.replace('/(auth)/login');
        return;
      }

      const formData = new FormData();
      formData.append('durationHours', calculatedHours);
      formData.append('clientStatus', clientStatus);
      formData.append('sessionNotes', sessionNotes);

      if (recordedVideoUri) {
        const videoFilename = recordedVideoUri.split('/').pop() || 'grpCoun-session.mp4';
        formData.append('video', {
          uri: recordedVideoUri,
          name: videoFilename,
          type: 'video/mp4',
        } as any);
      }

      if (recordedAudioUri) {
        const audioFilename = recordedAudioUri.split('/').pop() || 'grpCoun-session.m4a';
        formData.append('audio', {
          uri: recordedAudioUri,
          name: audioFilename,
          type: 'audio/m4a',
        } as any);
      }

      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/grpCoun/sessions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
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
      Alert.alert('Error', 'Failed to upload counseling record files. Please try again.');
    }
  };

  if (!cameraPermission?.granted || !microphonePermission?.granted) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.permissionText}>{translations[lang].permisionRequired}</Text>
        <Button title="Grant Permissions" onPress={() => { requestCameraPermission(); requestMicrophonePermissions(); }} />
      </View>
    );
  }

  return (
  <SafeAreaView style={styles.container}>
    <Header subtitle={translations[lang].grpCounSessionTitle}/>
    <ScrollView contentContainerStyle={styles.container}>
      
      <View style={styles.card}>
        <Text style={styles.sectionHeader}>{translations[lang].vidSesMode}</Text>
        <CameraView style={styles.cameraPreview} ref={cameraRef} facing="front">
          <View style={styles.overlayContainer}>
            <Text style={styles.timerDisplay}>{formatTime(secondsElapsed)}</Text>
          </View>
        </CameraView>

        <TouchableOpacity 
          style={[styles.actionButton, isSessionActive ? styles.stopButton : styles.startButton]} 
          onPress={handleToggleSession}
        >
          <Ionicons name={isSessionActive ? "stop-circle" : "videocam"} size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.buttonText}>{isSessionActive ? translations[lang].endSession : translations[lang].startSession}</Text>
        </TouchableOpacity>
        
        {recordedVideoUri && <Text style={styles.successUriText}>{translations[lang].videoCached}</Text>}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionHeader}>{translations[lang].audioOnlyMode}</Text>
        <TouchableOpacity 
          style={[styles.actionButton, isAudioRecording ? styles.stopButton : styles.audioStartButton]} 
          onPress={handleToggleAudioRecording}
          disabled={isSessionActive}
        >
          <Ionicons name={isAudioRecording ? "stop-circle" : "mic"} size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.buttonText}>{isAudioRecording ? translations[lang].endSession : translations[lang].startSession}</Text>
        </TouchableOpacity>
        
        {recordedAudioUri && <Text style={styles.successUriText}>{translations[lang].audioCached}</Text>}
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>{translations[lang].clientStatus}</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Stable, Reflective"
          placeholderTextColor="#999"
          value={clientStatus}
          onChangeText={setClientStatus}
          editable={!isSessionActive && !isAudioRecording}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>{translations[lang].detSesNotes}</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder={translations[lang].detSesNotesPlaceholder}
          placeholderTextColor="#999"
          multiline
          numberOfLines={5}
          value={sessionNotes}
          onChangeText={setSessionNotes}
        />
      </View>

      <TouchableOpacity 
        style={[styles.submitButton, (isSessionActive || isAudioRecording) && styles.disabledButton]} 
        onPress={handleSaveRecord}
        disabled={isSessionActive || isAudioRecording}
      >
        <Text style={styles.submitButtonText}>{translations[lang].savedCounRecBtn}</Text>
      </TouchableOpacity>
    </ScrollView>
  </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#0B0F19', flexGrow: 1 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  permissionText: { textAlign: 'center', marginBottom: 15, fontSize: 16, color: '#333' },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, marginTop: 10 },
  backButton: { marginRight: 15 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 20, borderWidth: 1, borderColor: '#e0e0e0', elevation: 2 },
  sectionHeader: { fontSize: 14, fontWeight: 'bold', color: '#444', marginBottom: 8 },
  cameraPreview: { width: '100%', height: 220, borderRadius: 8, overflow: 'hidden', justifyContent: 'flex-end', alignItems: 'center', marginBottom: 15 },
  overlayContainer: { backgroundColor: 'rgba(0,0,0,0.6)', width: '100%', paddingVertical: 6, alignItems: 'center' },
  timerDisplay: { fontSize: 24, fontWeight: 'bold', color: '#fff', fontVariant: ['tabular-nums'] },
  actionButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8, width: '100%', justifyContent: 'center' },
  startButton: { backgroundColor: '#28a745' },
  audioStartButton: { backgroundColor: '#0284c7' },
  stopButton: { backgroundColor: '#dc3545' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  successUriText: { marginTop: 8, fontSize: 12, color: '#28a745', fontWeight: '500' },
  formGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#444', marginBottom: 6 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 16, color: '#333' },
  textArea: { height: 100, textAlignVertical: 'top' },
  submitButton: { backgroundColor: '#007AFF', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  disabledButton: { backgroundColor: '#cccccc' },
  submitButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});