import { useAuth } from '@/context/AuthContext';
import { emptySections, findCase, MOCK_SESSIONS, SectionKey, SectionValue } from '@/data/mock/caseAnal';
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
import Header from '../../../components/Header';
import { CaseStatus } from '../../../components/modules/CaseCard';
import { useLanguage } from '../../../context/LanguageContext';
import { translations } from '../../../context/localization';

const SECTIONS: { key: SectionKey; bm: string; en: string; hintBm: string; hintEn: string }[] = [
  {
    key: 'concern',
    bm: 'Isu Utama',
    en: 'Presenting concern',
    hintBm: 'Apa yang dibawa oleh klien dan kenapa sekarang?',
    hintEn: 'What the client brings and why now.',
  },
  {
    key: 'background',
    bm: 'Latar Belakang',
    en: 'Background and history',
    hintBm: 'Keluarga, pendidikan, kerja, sejarah relevan (tanpa maklumat pengenalan).',
    hintEn: 'Family, education, work, relevant history (no identifying details).',
  },
  {
    key: 'assessment',
    bm: 'Penilaian',
    en: 'Assessment',
    hintBm: 'Pemerhatian, ujian, tahap risiko.',
    hintEn: 'Observations, measures used, risk level.',
  },
  {
    key: 'formulation',
    bm: 'Formulasi Kes',
    en: 'Case formulation',
    hintBm: 'Kefahaman berasaskan teori: faktor mencetus, mengekalkan, melindungi.',
    hintEn: 'Theory-based understanding: precipitating, maintaining, protective factors.',
  },
  {
    key: 'plan',
    bm: 'Pelan Intervensi',
    en: 'Intervention plan',
    hintBm: 'Matlamat, pendekatan, ukuran kemajuan.',
    hintEn: 'Goals, approach, how progress is measured.',
  },
  {
    key: 'ethics',
    bm: 'Etika dan Budaya',
    en: 'Ethical and cultural considerations',
    hintBm: 'Persetujuan, kerahsiaan, faktor budaya dan agama.',
    hintEn: 'Consent, confidentiality, cultural and religious factors.',
  },
];

export default function CaseAnalysisDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const isNew = id === 'new';
  const router = useRouter();
  const { lang } = useLanguage();
  const { checkAuthToken } = useAuth();
  const bm = lang === 'BM';

  // Mock data for now. TODO: replace findCase with a backend fetch (GET /api/caseAnal/cases/:id).
  const entry = isNew ? undefined : findCase(id);
  const [caseRef, setCaseRef] = useState(entry?.caseRef ?? '');
  const [status] = useState<CaseStatus>(entry?.status ?? 'draft');
  const [sections, setSections] = useState<Record<SectionKey, SectionValue>>(() => entry?.sections ?? emptySections());
  const [linked, setLinked] = useState<string[]>(entry?.linkedSessionIds ?? []);
  const [aiLoading, setAiLoading] = useState<SectionKey | null>(null);
  const [saving, setSaving] = useState(false);

  const feedback = entry?.supervisorFeedback
    ? { rating: entry.rating, comment: entry.supervisorFeedback }
    : null;

  const editable = status === 'draft' || status === 'revision';
  const allFilled = SECTIONS.every((s) => sections[s.key].text.trim().length > 0);
  const anyAiPending = SECTIONS.some((s) => sections[s.key].ai === 'pending');
  const canSubmit = editable && caseRef.trim().length > 0 && allFilled && !anyAiPending && !saving;

  const setText = (key: SectionKey, text: string) =>
    setSections((prev) => ({ ...prev, [key]: { ...prev[key], text } }));

  const toggleSession = (sid: string) =>
    setLinked((prev) => (prev.includes(sid) ? prev.filter((x) => x !== sid) : [...prev, sid]));

  const runAiDraft = async (key: SectionKey) => {
    const token = checkAuthToken();
    if (!token) {
      Alert.alert(bm ? 'Sesi tamat' : 'Session expired', bm ? 'Sila log masuk semula.' : 'Please sign in again.');
      return;
    }
    setAiLoading(key);
    try {
      // PLACEHOLDER endpoint: adjust to your backend. Send only de-identified data.
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/caseAnal/ai-draft`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          section: key,
          caseRef,
          sessionIds: linked,
          currentText: sections[key].text,
          language: lang,
        }),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data: { draft: string } = await response.json();
      setSections((prev) => ({ ...prev, [key]: { text: data.draft, ai: 'pending' } }));
    } catch {
      Alert.alert(
        bm ? 'Draf AI gagal' : 'AI draft failed',
        bm ? 'Tidak dapat menjana draf. Cuba lagi.' : 'Could not generate a draft. Please try again.',
      );
    } finally {
      setAiLoading(null);
    }
  };

  const askAiDraft = (key: SectionKey) => {
    if (sections[key].text.trim().length === 0) {
      runAiDraft(key);
      return;
    }
    Alert.alert(
      bm ? 'Gantikan teks?' : 'Replace text?',
      bm ? 'Draf AI akan menggantikan teks semasa bahagian ini.' : 'The AI draft will replace the current text in this section.',
      [
        { text: bm ? 'Batal' : 'Cancel', style: 'cancel' },
        { text: bm ? 'Gantikan' : 'Replace', style: 'destructive', onPress: () => runAiDraft(key) },
      ],
    );
  };

  const markReviewed = (key: SectionKey) =>
    setSections((prev) => ({ ...prev, [key]: { ...prev[key], ai: 'reviewed' } }));

  const save = async (submit: boolean) => {
    const token = checkAuthToken();
    if (!token) return;
    setSaving(true);
    try {
      // PLACEHOLDER endpoint and payload: adjust to your backend.
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/caseAnal/cases${isNew ? '' : `/${id}`}`,
        {
          method: isNew ? 'POST' : 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            caseRef,
            sessionIds: linked,
            sections: Object.fromEntries(SECTIONS.map((s) => [s.key, sections[s.key]])),
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
      bm ? 'Hantar untuk semakan?' : 'Submit for review?',
      bm ? 'Anda tidak boleh mengedit selepas dihantar.' : 'You will not be able to edit after submitting.',
      [
        { text: bm ? 'Batal' : 'Cancel', style: 'cancel' },
        { text: bm ? 'Hantar' : 'Submit', onPress: () => save(true) },
      ],
    );

  if (!isNew && !entry) {
    return (
      <SafeAreaView style={styles.container}>
        <Header subtitle={translations[lang].caseAnalTitle} />
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>{bm ? 'Rekod tidak ditemui.' : 'Record not found.'}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header subtitle={translations[lang].caseAnalTitle} />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {!editable && (
            <View style={styles.lockedNote}>
              <Ionicons name="lock-closed-outline" size={16} color="#475569" />
              <Text style={styles.lockedText}>
                {bm ? 'Analisis kes ini telah dihantar dan tidak boleh diedit lagi.' : 'This case analysis has been submitted and can no longer be edited.'}
              </Text>
            </View>
          )}

          {feedback && (
            <View style={styles.feedbackCard}>
              <Text style={styles.feedbackTitle}>
                {bm ? 'Maklum balas penyelia' : 'Supervisor feedback'}
                {feedback.rating !== undefined ? `  ★ ${feedback.rating.toFixed(1)}` : ''}
              </Text>
              <Text style={styles.feedbackText}>{feedback.comment}</Text>
            </View>
          )}

          {/* Case code */}
          <Text style={styles.label}>{bm ? 'Kod kes' : 'Case code'}</Text>
          <TextInput
            style={styles.input}
            value={caseRef}
            onChangeText={setCaseRef}
            editable={editable && isNew}
            placeholder="C-000"
            placeholderTextColor="#94A3B8"
            autoCapitalize="characters"
          />
          <View style={styles.privacyNote}>
            <Ionicons name="shield-checkmark-outline" size={16} color="#7C3AED" />
            <Text style={styles.privacyText}>
              {bm
                ? 'Jangan masukkan nama, IC, alamat atau butiran pengenalan klien. Draf AI hanya menerima data tanpa pengenalan.'
                : 'Do not enter client names, ID numbers, addresses or identifying details. AI drafts only receive de-identified data.'}
            </Text>
          </View>

          {/* Linked sessions */}
          <Text style={styles.label}>{bm ? 'Sesi dipautkan' : 'Linked sessions'}</Text>
          <View style={styles.sessionWrap}>
            {MOCK_SESSIONS.map((s) => {
              const on = linked.includes(s.id);
              return (
                <TouchableOpacity
                  key={s.id}
                  disabled={!editable}
                  style={[styles.sessionChip, on && styles.sessionChipOn]}
                  onPress={() => toggleSession(s.id)}
                  activeOpacity={0.7}
                >
                  <Ionicons name={on ? 'checkmark-circle' : 'ellipse-outline'} size={14} color={on ? '#FFFFFF' : '#64748B'} />
                  <Text style={[styles.sessionText, on && styles.sessionTextOn]}>{s.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Conceptualization sections */}
          {SECTIONS.map((s, index) => {
            const value = sections[s.key];
            const loading = aiLoading === s.key;
            return (
              <View key={s.key} style={styles.sectionCard}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>
                    {index + 1}. {bm ? s.bm : s.en}
                  </Text>
                  {value.ai === 'pending' && (
                    <View style={styles.pendingBadge}>
                      <Text style={styles.pendingText}>{bm ? 'Draf AI, perlu disemak' : 'AI draft, review needed'}</Text>
                    </View>
                  )}
                  {value.ai === 'reviewed' && (
                    <View style={styles.reviewedBadge}>
                      <Ionicons name="checkmark" size={11} color="#059669" />
                      <Text style={styles.reviewedText}>{bm ? 'AI, disemak' : 'AI, reviewed'}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.hint}>{bm ? s.hintBm : s.hintEn}</Text>
                <TextInput
                  style={[styles.input, styles.multiline]}
                  value={value.text}
                  onChangeText={(t) => setText(s.key, t)}
                  editable={editable && !loading}
                  multiline
                  textAlignVertical="top"
                  placeholderTextColor="#94A3B8"
                />
                {editable && (
                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      style={styles.aiButton}
                      onPress={() => askAiDraft(s.key)}
                      disabled={loading || aiLoading !== null}
                      activeOpacity={0.7}
                    >
                      {loading ? (
                        <ActivityIndicator size="small" color="#7C3AED" />
                      ) : (
                        <Ionicons name="sparkles" size={14} color="#7C3AED" />
                      )}
                      <Text style={styles.aiButtonText}>{bm ? 'Draf dengan AI' : 'Draft with AI'}</Text>
                    </TouchableOpacity>
                    {value.ai === 'pending' && (
                      <TouchableOpacity style={styles.reviewButton} onPress={() => markReviewed(s.key)} activeOpacity={0.7}>
                        <Text style={styles.reviewButtonText}>{bm ? 'Saya telah menyemak' : "I've reviewed this"}</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
            );
          })}

          {editable && (
            <>
              <TouchableOpacity
                style={[styles.primaryButton, !canSubmit && styles.buttonDisabled]}
                disabled={!canSubmit}
                onPress={confirmSubmit}
                activeOpacity={0.8}
              >
                <Text style={styles.primaryButtonText}>{bm ? 'Hantar untuk semakan' : 'Submit for review'}</Text>
              </TouchableOpacity>
              {!canSubmit && (
                <Text style={styles.submitHint}>
                  {anyAiPending
                    ? bm
                      ? 'Semak semua draf AI sebelum menghantar.'
                      : 'Review every AI draft before submitting.'
                    : bm
                      ? 'Isi kod kes dan semua bahagian untuk menghantar.'
                      : 'Fill in the case code and every section to submit.'}
                </Text>
              )}
              <TouchableOpacity
                style={styles.secondaryButton}
                disabled={saving || caseRef.trim().length === 0}
                onPress={() => save(false)}
                activeOpacity={0.8}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#7C3AED" />
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
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  notFoundText: { fontSize: 14, color: '#64748B', textAlign: 'center' },
  lockedNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  lockedText: { flex: 1, fontSize: 12, color: '#475569', lineHeight: 16 },
  container: { flex: 1, backgroundColor: '#0B0F19' },
  content: { padding: 16, paddingBottom: 48 },
  label: { fontSize: 12, fontWeight: '700', color: '#475569', marginBottom: 6, marginTop: 4 },
  input: {backgroundColor: '#FFFFFF',borderWidth: 1,borderColor: '#E2E8F0',borderRadius: 12,paddingHorizontal: 14,paddingVertical: 10,fontSize: 14,color: '#0F172A',},
  multiline: { minHeight: 110 },
  privacyNote: {flexDirection: 'row',alignItems: 'center',gap: 8,backgroundColor: '#F3E8FF',borderRadius: 12,padding: 12,marginTop: 10,marginBottom: 14,},
  privacyText: { flex: 1, fontSize: 12, color: '#5B21B6', lineHeight: 16 },
  sessionWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  sessionChip: {flexDirection: 'row',alignItems: 'center',gap: 6,paddingHorizontal: 12,paddingVertical: 7,borderRadius: 999,backgroundColor: '#FFFFFF',borderWidth: 1,borderColor: '#E2E8F0',},
  sessionChipOn: { backgroundColor: '#7C3AED', borderColor: '#7C3AED' },
  sessionText: { fontSize: 12, color: '#475569', fontWeight: '600' },
  sessionTextOn: { color: '#FFFFFF' },
  sectionCard: {backgroundColor: '#FFFFFF',borderRadius: 16,padding: 16,marginBottom: 12,borderWidth: 1,borderColor: '#E2E8F0',},
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  sectionTitle: { flex: 1, fontSize: 14, fontWeight: '700', color: '#0F172A' },
  hint: { fontSize: 11, color: '#64748B', marginTop: 2, marginBottom: 10, lineHeight: 15 },
  pendingBadge: { backgroundColor: '#FEF3C7', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  pendingText: { fontSize: 10, fontWeight: '700', color: '#B45309' },
  reviewedBadge: {flexDirection: 'row',alignItems: 'center',gap: 3,backgroundColor: '#D1FAE5',paddingHorizontal: 8,paddingVertical: 3,borderRadius: 999,},
  reviewedText: { fontSize: 10, fontWeight: '700', color: '#059669' },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10, flexWrap: 'wrap' },
  aiButton: {flexDirection: 'row',alignItems: 'center',gap: 6,paddingHorizontal: 12,paddingVertical: 7,borderRadius: 999,backgroundColor: '#F3E8FF',},
  aiButtonText: { fontSize: 12, fontWeight: '700', color: '#7C3AED' },
  reviewButton: {paddingHorizontal: 12,paddingVertical: 7,borderRadius: 999,borderWidth: 1,borderColor: '#059669',},
  reviewButtonText: { fontSize: 12, fontWeight: '700', color: '#059669' },
  feedbackCard: {backgroundColor: '#FEF3C7',borderRadius: 12,padding: 14,marginBottom: 14,},
  feedbackTitle: { fontSize: 13, fontWeight: '700', color: '#92400E', marginBottom: 4 },
  feedbackText: { fontSize: 12, color: '#92400E', lineHeight: 17 },
  primaryButton: {backgroundColor: '#7C3AED',borderRadius: 14,paddingVertical: 14,alignItems: 'center',marginTop: 8,},
  buttonDisabled: { opacity: 0.4 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  submitHint: { fontSize: 11, color: '#64748B', textAlign: 'center', marginTop: 8 },
  secondaryButton: {borderRadius: 14,paddingVertical: 14,alignItems: 'center',marginTop: 10,borderWidth: 1,borderColor: '#7C3AED',},
  secondaryButtonText: { color: '#7C3AED', fontSize: 15, fontWeight: '700' },
});
