import AiFeedbackCard from '@/components/modules/AiFeedbackCard';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { translations } from '@/context/localization';
import { usePollSession } from '@/hooks/use-session-poll';
import { ApiError } from '@/services/api';
import { submitSession } from '@/services/counseling';
import { Ionicons } from '@expo/vector-icons';
import { AudioModule, RecordingPresets, useAudioRecorder } from 'expo-audio';
import { CameraView, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Button, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../components/Header';

export default function GroupCounselingScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { lang } = useLanguage();

  const cameraRef = useRef<CameraView | null>(null);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [microphonePermission, requestMicrophonePermissions] = useMicrophonePermissions();
  
  // Session timer states
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [recordedVideoUri, setRecordedVideoUri] = useState<string | null>(null);
  
  // Audio recording states 
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const [isAudioRecording, setIsAudioRecording] = useState(false);
  const [recordedAudioUri, setRecordedAudioUri] = useState<string | null>(null);

  // Form states
  const [clientStatus, setClientStatus] = useState('');
  const [sessionNotes, setSessionNotes] = useState('');
  const [caseCode, setCaseCode] = useState('');
  const [consent, setConsent] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState<number | null>(null);
  const polled = usePollSession('grpCoun', savedId);

  useEffect(() => {
    if (!cameraPermission?.granted) requestCameraPermission();
    if (!microphonePermission?.granted) requestMicrophonePermissions();

    (async () => {
      try {
        await AudioModule.requestRecordingPermissionsAsync();
      } catch (e) {
        console.error('Failed to request audio permissions:', e);
      }
    })();
  }, [cameraPermission, microphonePermission]);
  
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
    const bm = lang === 'BM';
    if (isSessionActive || isAudioRecording) {
      Alert.alert(translations[lang].activeSession, translations[lang].saveRecordDesc);
      return;
    }

    if (secondsElapsed === 0) {
      Alert.alert(translations[lang].error, translations[lang].noRecord);
      return;
    }

    if (!caseCode.trim()) {
      Alert.alert(
        bm ? 'Kod kes diperlukan' : 'Case code required',
        bm ? 'Masukkan kod kes, bukan nama klien.' : 'Enter a case code, not the client name.',
      );
      return;
    }

    if (!consent) {
      Alert.alert(
        bm ? 'Persetujuan diperlukan' : 'Consent required',
        bm ? 'Sahkan bahawa klien bersetuju dengan rakaman.' : 'Confirm that the client agreed to the recording.',
      );
      return;
    }

    setSaving(true);
    try {
      const session = await submitSession('grpCoun', {
        caseCode,
        sessionNotes,
        clientStatus,
        durationHours: secondsElapsed / 3600,
        consent,
        language: lang as 'BM' | 'EN',
        audioUri: recordedAudioUri ?? undefined,
        videoUri: recordedVideoUri ?? undefined,
      });
      setSavedId(session.id); // the feedback card below takes over from here
    } catch (error) {
      console.error('Submission error:', error);
      if (error instanceof ApiError && error.status === 401) {
        Alert.alert(translations[lang].sessionExpired, translations[lang].loginAgain);
        router.replace('/(auth)/login');
      } else {
        Alert.alert(translations[lang].error, error instanceof Error ? error.message : 'Failed to upload counseling record files. Please try again.');
      }
    } finally {
      setSaving(false);
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
        <Text style={styles.label}>{lang === 'BM' ? 'Kod kes (bukan nama klien)' : 'Case code (not the client name)'}</Text>
        <TextInput
          style={styles.input}
          placeholder="C-000"
          placeholderTextColor="#999"
          autoCapitalize="characters"
          value={caseCode}
          onChangeText={setCaseCode}
          editable={!isSessionActive && !isAudioRecording && savedId === null}
        />
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

      <View style={styles.consentRow}>
        <Text style={styles.consentText}>
          {lang === 'BM' ? 'Klien telah bersetuju dengan rakaman ini' : 'The client agreed to this recording'}
        </Text>
        <Switch value={consent} onValueChange={setConsent} disabled={savedId !== null} />
      </View>

      {savedId === null ? (
        <TouchableOpacity
          style={[styles.submitButton, (isSessionActive || isAudioRecording || saving) && styles.disabledButton]}
          onPress={handleSaveRecord}
          disabled={isSessionActive || isAudioRecording || saving}
        >
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>{translations[lang].savedCounRecBtn}</Text>}
        </TouchableOpacity>
      ) : (
        <>
          <AiFeedbackCard session={polled.session} lang={lang as 'BM' | 'EN'} error={polled.error} />
          <TouchableOpacity style={styles.submitButton} onPress={() => router.back()}>
            <Text style={styles.submitButtonText}>{lang === 'BM' ? 'Selesai' : 'Done'}</Text>
          </TouchableOpacity>
        </>
      )}
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
  consentRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  consentText: { flex: 1, fontSize: 14, color: '#CBD5E1', marginRight: 12 },
  submitButton: { backgroundColor: '#007AFF', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  disabledButton: { backgroundColor: '#cccccc' },
  submitButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});