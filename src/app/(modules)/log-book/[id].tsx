import { useAuth } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
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
import { LogCategory, LogStatus } from '../../../components//modules/LogEntryCard';
import Header from '../../../components/Header';
import { useLanguage } from '../../../context/LanguageContext';
import { translations } from '../../../context/localization';

const CATEGORIES: { key: LogCategory; bm: string; en: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'individual', bm: 'Kaunseling Individu', en: 'Individual', icon: 'person-outline' },
  { key: 'group', bm: 'Kaunseling Kumpulan', en: 'Group', icon: 'people-outline' },
  { key: 'supervision', bm: 'Penyeliaan', en: 'Supervision', icon: 'school-outline' },
  { key: 'other', bm: 'Lain-lain', en: 'Other', icon: 'ellipsis-horizontal-outline' },
];

// Local date as YYYY-MM-DD (toISOString would give the UTC date, which is "yesterday" in Malaysia before 8am).
const todayLocal = () => {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
};

const isValidPastOrToday = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return false;
  // Reject dates like 2026-02-31 that JS silently rolls over.
  if (parsed.getFullYear() !== Number(value.slice(0, 4)) || parsed.getMonth() + 1 !== Number(value.slice(5, 7))) {
    return false;
  }
  return value <= todayLocal();
};

export default function LogBookDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const isNew = id === 'new';
  const router = useRouter();
  const { lang } = useLanguage();
  const { checkAuthToken } = useAuth();
  const bm = lang === 'BM';

  // TODO: when !isNew, load the entry from the backend instead of starting empty.
  const [status] = useState<LogStatus>('draft');
  const [date, setDate] = useState(todayLocal());
  const [hours, setHours] = useState(1);
  const [category, setCategory] = useState<LogCategory>('individual');
  const [caseRef, setCaseRef] = useState('');
  const [activity, setActivity] = useState('');
  const [learning, setLearning] = useState('');
  const [saving, setSaving] = useState(false);

  // TODO: only when status is 'returned' or 'approved'; comes from the supervisor.
  const supervisorComment = null as string | null;

  const editable = status === 'draft' || status === 'returned';
  const dateOk = isValidPastOrToday(date);
  const canSubmit = editable && dateOk && hours > 0 && activity.trim().length > 0 && !saving;

  const stepHours = (delta: number) => setHours((h) => Math.min(12, Math.max(0.5, h + delta)));

  const save = async (submit: boolean) => {
    const token = checkAuthToken();
    if (!token) {
      Alert.alert(bm ? 'Sesi tamat' : 'Session expired', bm ? 'Sila log masuk semula.' : 'Please sign in again.');
      return;
    }
    setSaving(true);
    try {
      // PLACEHOLDER endpoint and payload: adjust to your backend.
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/logBook/entries${isNew ? '' : `/${id}`}`,
        {
          method: isNew ? 'POST' : 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            date,
            hours,
            category,
            caseRef: caseRef.trim() || null,
            activity: activity.trim(),
            learning: learning.trim(),
            status: submit ? 'submitted' : 'draft',
          }),
        },
      );
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      router.back();
    } catch {
      Alert.alert(bm ? 'Gagal menyimpan' : 'Save failed', bm ? 'Cuba lagi.' : 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const confirmSubmit = () =>
    Alert.alert(
      bm ? 'Hantar untuk kelulusan?' : 'Submit for approval?',
      bm ? 'Anda tidak boleh mengedit selepas dihantar.' : 'You will not be able to edit after submitting.',
      [
        { text: bm ? 'Batal' : 'Cancel', style: 'cancel' },
        { text: bm ? 'Hantar' : 'Submit', onPress: () => save(true) },
      ],
    );

  return (
    <SafeAreaView style={styles.container}>
      <Header subtitle={translations[lang].logBookTitle} />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {supervisorComment && (
            <View style={styles.feedbackCard}>
              <Text style={styles.feedbackTitle}>{bm ? 'Maklum balas penyelia' : 'Supervisor comment'}</Text>
              <Text style={styles.feedbackText}>{supervisorComment}</Text>
            </View>
          )}

          {/* Date */}
          <Text style={styles.label}>{bm ? 'Tarikh' : 'Date'}</Text>
          <View style={styles.dateRow}>
            <TextInput
              style={[styles.input, styles.dateInput, !dateOk && styles.inputError]}
              value={date}
              onChangeText={setDate}
              editable={editable}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#94A3B8"
              keyboardType="numbers-and-punctuation"
              maxLength={10}
            />
            {editable && (
              <TouchableOpacity style={styles.todayButton} onPress={() => setDate(todayLocal())} activeOpacity={0.7}>
                <Text style={styles.todayText}>{bm ? 'Hari ini' : 'Today'}</Text>
              </TouchableOpacity>
            )}
          </View>
          {!dateOk && (
            <Text style={styles.errorText}>
              {bm ? 'Gunakan format YYYY-MM-DD, tidak boleh pada masa depan.' : 'Use YYYY-MM-DD, and not a future date.'}
            </Text>
          )}

          {/* Hours */}
          <Text style={styles.label}>{bm ? 'Jam' : 'Hours'}</Text>
          <View style={styles.stepper}>
            <TouchableOpacity
              style={styles.stepButton}
              onPress={() => stepHours(-0.5)}
              disabled={!editable || hours <= 0.5}
              activeOpacity={0.7}
            >
              <Ionicons name="remove" size={20} color="#D97706" />
            </TouchableOpacity>
            <Text style={styles.stepValue}>{hours.toFixed(1)}</Text>
            <TouchableOpacity
              style={styles.stepButton}
              onPress={() => stepHours(0.5)}
              disabled={!editable || hours >= 12}
              activeOpacity={0.7}
            >
              <Ionicons name="add" size={20} color="#D97706" />
            </TouchableOpacity>
          </View>

          {/* Category */}
          <Text style={styles.label}>{bm ? 'Kategori' : 'Category'}</Text>
          <View style={styles.chipWrap}>
            {CATEGORIES.map((c) => {
              const on = c.key === category;
              return (
                <TouchableOpacity
                  key={c.key}
                  disabled={!editable}
                  style={[styles.chip, on && styles.chipOn]}
                  onPress={() => setCategory(c.key)}
                  activeOpacity={0.7}
                >
                  <Ionicons name={c.icon} size={14} color={on ? '#FFFFFF' : '#64748B'} />
                  <Text style={[styles.chipText, on && styles.chipTextOn]}>{bm ? c.bm : c.en}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Case code (optional) */}
          <Text style={styles.label}>{bm ? 'Kod kes (pilihan)' : 'Case code (optional)'}</Text>
          <TextInput
            style={styles.input}
            value={caseRef}
            onChangeText={setCaseRef}
            editable={editable}
            placeholder="C-000"
            placeholderTextColor="#94A3B8"
            autoCapitalize="characters"
          />
          <View style={styles.privacyNote}>
            <Ionicons name="shield-checkmark-outline" size={16} color="#B45309" />
            <Text style={styles.privacyText}>
              {bm
                ? 'Jangan masukkan nama, IC, alamat atau butiran pengenalan klien.'
                : 'Do not enter client names, ID numbers, addresses or identifying details.'}
            </Text>
          </View>

          {/* Activity */}
          <Text style={styles.label}>{bm ? 'Aktiviti' : 'Activity'}</Text>
          <TextInput
            style={[styles.input, styles.multiline]}
            value={activity}
            onChangeText={setActivity}
            editable={editable}
            multiline
            textAlignVertical="top"
            placeholder={bm ? 'Apa yang dilakukan dalam sesi ini?' : 'What was done in this session?'}
            placeholderTextColor="#94A3B8"
          />

          {/* Learning */}
          <Text style={styles.label}>{bm ? 'Pembelajaran / refleksi ringkas' : 'Learning / brief reflection'}</Text>
          <TextInput
            style={[styles.input, styles.multiline]}
            value={learning}
            onChangeText={setLearning}
            editable={editable}
            multiline
            textAlignVertical="top"
            placeholder={bm ? 'Apa yang dipelajari atau ingin dibincangkan dengan penyelia?' : 'What you learned, or want to discuss with your supervisor.'}
            placeholderTextColor="#94A3B8"
          />

          {editable && (
            <>
              <TouchableOpacity
                style={[styles.primaryButton, !canSubmit && styles.buttonDisabled]}
                disabled={!canSubmit}
                onPress={confirmSubmit}
                activeOpacity={0.8}
              >
                <Text style={styles.primaryButtonText}>{bm ? 'Hantar untuk kelulusan' : 'Submit for approval'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.secondaryButton}
                disabled={saving || !dateOk}
                onPress={() => save(false)}
                activeOpacity={0.8}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#D97706" />
                ) : (
                  <Text style={styles.secondaryButtonText}>{bm ? 'Simpan draf' : 'Save draft'}</Text>
                )}
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { padding: 16, paddingBottom: 48 },
  label: { fontSize: 12, fontWeight: '700', color: '#475569', marginBottom: 6, marginTop: 14 },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
  },
  inputError: { borderColor: '#DC2626' },
  errorText: { fontSize: 11, color: '#DC2626', marginTop: 4 },
  multiline: { minHeight: 100 },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dateInput: { flex: 1 },
  todayButton: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, backgroundColor: '#FEF3C7' },
  todayText: { fontSize: 12, fontWeight: '700', color: '#B45309' },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
  },
  stepButton: { padding: 12 },
  stepValue: { minWidth: 56, textAlign: 'center', fontSize: 18, fontWeight: '700', color: '#0F172A' },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipOn: { backgroundColor: '#D97706', borderColor: '#D97706' },
  chipText: { fontSize: 12, fontWeight: '600', color: '#475569' },
  chipTextOn: { color: '#FFFFFF' },
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
  },
  privacyText: { flex: 1, fontSize: 12, color: '#92400E', lineHeight: 16 },
  feedbackCard: { backgroundColor: '#FEE2E2', borderRadius: 12, padding: 14 },
  feedbackTitle: { fontSize: 13, fontWeight: '700', color: '#991B1B', marginBottom: 4 },
  feedbackText: { fontSize: 12, color: '#991B1B', lineHeight: 17 },
  primaryButton: {
    backgroundColor: '#D97706',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonDisabled: { opacity: 0.4 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  secondaryButton: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#D97706',
  },
  secondaryButtonText: { color: '#D97706', fontSize: 15, fontWeight: '700' },
});
