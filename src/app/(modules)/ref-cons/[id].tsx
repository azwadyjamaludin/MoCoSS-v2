import Header from '@/components/Header';
import { REFCONS_STATUS, RefConsKind, RefConsStatus } from '@/components/modules/RefConsCard';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { translations } from '@/context/localization';
import { findRefCons } from '@/data/mock/refCons';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View, } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const CONSULTANTS = [
  { key: 'supervisor', bm: 'Penyelia', en: 'Supervisor' },
  { key: 'peer', bm: 'Rakan sejawat', en: 'Peer' },
  { key: 'other', bm: 'Lain-lain', en: 'Other' },
];

const REFERRAL_TARGETS = [
  { key: 'medical', bm: 'Psikiatri / perubatan', en: 'Psychiatrist / medical' },
  { key: 'welfare', bm: 'Kebajikan sosial', en: 'Social welfare' },
  { key: 'education', bm: 'Pendidikan / sekolah', en: 'Education / school' },
  { key: 'other', bm: 'Agensi lain', en: 'Other agency' },
];

export default function RefConsDetailScreen() {
  const { id, kind: kindParam } = useLocalSearchParams<{ id: string; kind?: string }>();
  const isNew = id === 'new';
  const router = useRouter();
  const { lang } = useLanguage();
  const { checkAuthToken } = useAuth();
  const bm = lang === 'BM';

  // Mock data for now. TODO: replace findRefCons with a backend fetch (GET /api/refCons/items/:id).
  const entry = isNew ? undefined : findRefCons(id);

  // The kind is chosen when creating and cannot change afterwards.
  const kind: RefConsKind = entry ? entry.kind : kindParam === 'referral' ? 'referral' : 'consultation';
  const isReferral = kind === 'referral';

  const [status] = useState<RefConsStatus>(entry?.status ?? 'draft');
  const [topic, setTopic] = useState(entry?.topic ?? '');
  const [caseRef, setCaseRef] = useState(entry?.caseRef ?? '');
  const [saving, setSaving] = useState(false);

  // Consultation fields
  const [consultant, setConsultant] = useState(entry?.consultant ?? 'supervisor');
  const [situation, setSituation] = useState(entry?.situation ?? '');
  const [reflection, setReflection] = useState(entry?.reflection ?? '');
  const [question, setQuestion] = useState(entry?.question ?? '');
  const [ethical, setEthical] = useState(entry?.ethical ?? false);

  // Referral fields
  const [target, setTarget] = useState(entry?.targetKey ?? '');
  const [urgent, setUrgent] = useState(entry?.urgent ?? false);
  const [reason, setReason] = useState(entry?.reason ?? '');
  const [workSoFar, setWorkSoFar] = useState(entry?.workSoFar ?? '');
  const [consent, setConsent] = useState(entry?.consent ?? false);

  // Reply from the consultant or the receiving service.
  const response = entry?.response ?? null;

  const editable = status === 'draft';
  const statusInfo = REFCONS_STATUS[status];

  const consultationReady = topic.trim() && situation.trim() && question.trim();
  const referralReady = caseRef.trim() && target && reason.trim() && consent;
  const canSubmit = editable && !saving && Boolean(isReferral ? referralReady : consultationReady);

  const save = async (submit: boolean) => {
    const token = checkAuthToken();
    if (!token) {
      Alert.alert(bm ? 'Sesi tamat' : 'Session expired', bm ? 'Sila log masuk semula.' : 'Please sign in again.');
      return;
    }
    setSaving(true);
    try {
      // PLACEHOLDER endpoint and payload
      const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/refCons/items${isNew ? '' : `/${id}`}`, {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          kind,
          topic: topic.trim(),
          caseRef: caseRef.trim() || null,
          status: submit ? 'submitted' : 'draft',
          ...(isReferral
            ? { target, urgent, reason: reason.trim(), workSoFar: workSoFar.trim(), consent }
            : { consultant, situation: situation.trim(), reflection: reflection.trim(), question: question.trim(), ethical }),
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      router.back();
    } catch {
      Alert.alert(bm ? 'Gagal menyimpan' : 'Save failed', bm ? 'Cuba lagi.' : 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const confirmSubmit = () =>
    Alert.alert(
      isReferral ? (bm ? 'Hantar rujukan?' : 'Send referral?') : bm ? 'Hantar untuk konsultasi?' : 'Send for consultation?',
      bm ? 'Anda tidak boleh mengedit selepas dihantar.' : 'You will not be able to edit after sending.',
      [
        { text: bm ? 'Batal' : 'Cancel', style: 'cancel' },
        { text: bm ? 'Hantar' : 'Send', onPress: () => save(true) },
      ],
    );

  const chips = (
    options: { key: string; bm: string; en: string }[],
    value: string,
    onChange: (key: string) => void,
  ) => (
    <View style={styles.chipWrap}>
      {options.map((o) => {
        const on = o.key === value;
        return (
          <TouchableOpacity
            key={o.key}
            disabled={!editable}
            style={[styles.chip, on && styles.chipOn]}
            onPress={() => onChange(o.key)}
            activeOpacity={0.7}
          >
            <Text style={[styles.chipText, on && styles.chipTextOn]}>{bm ? o.bm : o.en}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const textArea = (
    label: string,
    value: string,
    onChange: (t: string) => void,
    placeholder: string,
  ) => (
    <>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, styles.multiline]}
        value={value}
        onChangeText={onChange}
        editable={editable}
        multiline
        textAlignVertical="top"
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
      />
    </>
  );

  const toggle = (label: string, value: boolean, onChange: (v: boolean) => void) => (
    <View style={styles.toggleRow}>
      <Text style={styles.toggleLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onChange}
        disabled={!editable}
        trackColor={{ true: '#DC2626' }}
      />
    </View>
  );

  if (!isNew && !entry) {
    return (
      <SafeAreaView style={styles.container}>
        <Header subtitle={translations[lang].refConsTitle} />
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>{bm ? 'Rekod tidak ditemui.' : 'Record not found.'}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header subtitle={translations[lang].refConsTitle} />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.kindRow}>
            <Ionicons name={isReferral ? 'git-network-outline' : 'chatbubbles-outline'} size={18} color="#DC2626" />
            <Text style={styles.kindText}>
              {isReferral
                ? bm ? 'Rujukan klien' : 'Client referral'
                : bm ? 'Konsultasi reflektif' : 'Reflective consultation'}
            </Text>
            <View style={[styles.statusChip, { backgroundColor: statusInfo.color + '18' }]}>
              <Text style={[styles.statusText, { color: statusInfo.color }]}>{bm ? statusInfo.bm : statusInfo.en}</Text>
            </View>
          </View>

          {!editable && (
            <View style={styles.lockedNote}>
              <Ionicons name="lock-closed-outline" size={16} color="#475569" />
              <Text style={styles.lockedText}>
                {bm ? 'Rekod ini telah dihantar dan tidak boleh diedit lagi.' : 'This record has been sent and can no longer be edited.'}
              </Text>
            </View>
          )}

          {response && (
            <View style={styles.responseCard}>
              <Text style={styles.responseTitle}>
                {isReferral ? (bm ? 'Maklum balas perkhidmatan' : 'Response from the service') : bm ? 'Maklum balas perunding' : 'Consultant response'}
              </Text>
              <Text style={styles.responseText}>{response}</Text>
            </View>
          )}

          <View style={styles.privacyNote}>
            <Ionicons name="shield-checkmark-outline" size={16} color="#B91C1C" />
            <Text style={styles.privacyText}>
              {bm
                ? 'Jangan masukkan nama, IC, alamat atau butiran pengenalan klien. Gunakan kod kes.'
                : 'Do not enter client names, ID numbers, addresses or identifying details. Use the case code.'}
            </Text>
          </View>

          {/* Shared */}
          <Text style={styles.label}>{isReferral ? (bm ? 'Ringkasan rujukan' : 'Referral summary') : bm ? 'Tajuk' : 'Topic'}</Text>
          <TextInput
            style={styles.input}
            value={topic}
            onChangeText={setTopic}
            editable={editable}
            placeholder={bm ? 'Satu baris ringkas, tanpa butiran pengenalan' : 'One short line, no identifying details'}
            placeholderTextColor="#94A3B8"
          />

          <Text style={styles.label}>
            {bm ? 'Kod kes' : 'Case code'}
            {isReferral ? '' : bm ? ' (pilihan)' : ' (optional)'}
          </Text>
          <TextInput
            style={styles.input}
            value={caseRef}
            onChangeText={setCaseRef}
            editable={editable}
            placeholder="C-000"
            placeholderTextColor="#94A3B8"
            autoCapitalize="characters"
          />

          {isReferral ? (
            <>
              <Text style={styles.label}>{bm ? 'Dirujuk kepada' : 'Refer to'}</Text>
              {chips(REFERRAL_TARGETS, target, setTarget)}

              {toggle(bm ? 'Segera' : 'Urgent', urgent, setUrgent)}
              {urgent && (
                <View style={styles.urgentNote}>
                  <Ionicons name="warning-outline" size={16} color="#B91C1C" />
                  <Text style={styles.urgentText}>
                    {bm
                      ? 'Jika klien berisiko serta-merta, ikut protokol kecemasan anda dahulu. Aplikasi ini bukan saluran kecemasan.'
                      : 'If a client is at immediate risk, follow your emergency protocol first. This app is not an emergency channel.'}
                  </Text>
                </View>
              )}

              {textArea(
                bm ? 'Sebab rujukan' : 'Reason for referral',
                reason,
                setReason,
                bm ? 'Kenapa rujukan diperlukan sekarang?' : 'Why is a referral needed now?',
              )}
              {textArea(
                bm ? 'Kerja setakat ini (pilihan)' : 'Work so far (optional)',
                workSoFar,
                setWorkSoFar,
                bm ? 'Ringkasan intervensi dan respons klien.' : 'Summary of interventions and how the client responded.',
              )}

              {toggle(
                bm ? 'Persetujuan klien telah diperoleh' : 'Client consent obtained',
                consent,
                setConsent,
              )}
              {!consent && (
                <Text style={styles.consentHint}>
                  {bm ? 'Persetujuan diperlukan sebelum rujukan dihantar.' : 'Consent is required before the referral can be sent.'}
                </Text>
              )}
            </>
          ) : (
            <>
              <Text style={styles.label}>{bm ? 'Berunding dengan' : 'Consult with'}</Text>
              {chips(CONSULTANTS, consultant, setConsultant)}

              {textArea(
                bm ? 'Apa yang berlaku' : 'What happened',
                situation,
                setSituation,
                bm ? 'Terangkan situasi secara ringkas dan objektif.' : 'Describe the situation briefly and factually.',
              )}
              {textArea(
                bm ? 'Refleksi: fikiran dan perasaan saya' : 'Reflection: my thoughts and feelings',
                reflection,
                setReflection,
                bm ? 'Apa yang saya rasa, dan bagaimana ia mempengaruhi saya sebagai kaunselor?' : 'What I felt, and how it affected me as a counselor.',
              )}
              {textArea(
                bm ? 'Soalan untuk perunding' : 'Question for the consultant',
                question,
                setQuestion,
                bm ? 'Apa yang ingin dibincangkan atau diputuskan?' : 'What do I want to discuss or decide?',
              )}

              {toggle(bm ? 'Melibatkan dilema etika' : 'Involves an ethical dilemma', ethical, setEthical)}
            </>
          )}

          {editable && (
            <>
              <TouchableOpacity
                style={[styles.primaryButton, !canSubmit && styles.buttonDisabled]}
                disabled={!canSubmit}
                onPress={confirmSubmit}
                activeOpacity={0.8}
              >
                <Text style={styles.primaryButtonText}>
                  {isReferral ? (bm ? 'Hantar rujukan' : 'Send referral') : bm ? 'Hantar untuk konsultasi' : 'Send for consultation'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.secondaryButton}
                disabled={saving}
                onPress={() => save(false)}
                activeOpacity={0.8}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#DC2626" />
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
  notFoundText: { fontSize: 14, color: '#94A3B8', textAlign: 'center' },
  lockedNote: {flexDirection: 'row',alignItems: 'center',gap: 8,backgroundColor: '#F1F5F9',borderRadius: 12,padding: 12,marginBottom: 12,},
  lockedText: { flex: 1, fontSize: 12, color: '#475569', lineHeight: 16 },
  container: { flex: 1, backgroundColor: '#0B0F19' },
  content: { padding: 16, paddingBottom: 48 },
  kindRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  kindText: { flex: 1, fontSize: 15, fontWeight: '700', color: '#F8FAFC' },
  statusChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  statusText: { fontSize: 11, fontWeight: '700' },
  label: { fontSize: 12, fontWeight: '700', color: '#CBD5E1', marginBottom: 6, marginTop: 14 },
  input: {backgroundColor: '#FFFFFF',borderWidth: 1,borderColor: '#E2E8F0',borderRadius: 12,paddingHorizontal: 14,paddingVertical: 10,fontSize: 14,color: '#0F172A',},
  multiline: { minHeight: 100 },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {paddingHorizontal: 12,paddingVertical: 7,borderRadius: 999,backgroundColor: '#FFFFFF',borderWidth: 1,borderColor: '#E2E8F0',},
  chipOn: { backgroundColor: '#DC2626', borderColor: '#DC2626' },
  chipText: { fontSize: 12, fontWeight: '600', color: '#475569' },
  chipTextOn: { color: '#FFFFFF' },
  toggleRow: {flexDirection: 'row',alignItems: 'center',justifyContent: 'space-between',backgroundColor: '#FFFFFF',borderWidth: 1,borderColor: '#E2E8F0',borderRadius: 12,paddingHorizontal: 14,paddingVertical: 8,marginTop: 14,},
  toggleLabel: { flex: 1, fontSize: 13, fontWeight: '600', color: '#0F172A', paddingRight: 8 },
  privacyNote: {flexDirection: 'row',alignItems: 'center',gap: 8,backgroundColor: '#FEE2E2',borderRadius: 12,padding: 12,},
  privacyText: { flex: 1, fontSize: 12, color: '#991B1B', lineHeight: 16 },
  urgentNote: {flexDirection: 'row',alignItems: 'center',gap: 8,backgroundColor: '#FEF3C7',borderRadius: 12,padding: 12,marginTop: 8,},
  urgentText: { flex: 1, fontSize: 12, color: '#92400E', lineHeight: 16 },
  consentHint: { fontSize: 11, color: '#94A3B8', marginTop: 6 },
  responseCard: { backgroundColor: '#DBEAFE', borderRadius: 12, padding: 14, marginBottom: 12 },
  responseTitle: { fontSize: 13, fontWeight: '700', color: '#1E40AF', marginBottom: 4 },
  responseText: { fontSize: 12, color: '#1E40AF', lineHeight: 17 },
  primaryButton: {backgroundColor: '#DC2626',borderRadius: 14,paddingVertical: 14,alignItems: 'center',marginTop: 24,},
  buttonDisabled: { opacity: 0.4 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  secondaryButton: {borderRadius: 14,paddingVertical: 14,alignItems: 'center',marginTop: 10,borderWidth: 1,borderColor: '#DC2626',},
  secondaryButtonText: { color: '#DC2626', fontSize: 15, fontWeight: '700' },
});
