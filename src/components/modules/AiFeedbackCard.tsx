import type { CounselingSession } from '@/services/counseling';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const ACCENT = '#7C3AED';

interface Props {
  session: CounselingSession | null;
  lang: 'BM' | 'EN';
  error?: string | null;
}

/** Shows the AI step of a counseling session: waiting, failed, or the feedback itself. */
export default function AiFeedbackCard({ session, lang, error }: Props) {
  const bm = lang === 'BM';
  const [showTranscript, setShowTranscript] = useState(false);
  const status = session?.ai_status ?? 'pending';

  if (status === 'none') {
    return (
      <View style={styles.card}>
        <Text style={styles.muted}>
          {bm ? 'Tiada rakaman audio, jadi tiada maklum balas AI.' : 'No audio recording, so there is no AI feedback.'}
        </Text>
      </View>
    );
  }

  if (status === 'pending' || status === 'processing') {
    return (
      <View style={[styles.card, styles.row]}>
        <ActivityIndicator color={ACCENT} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.title}>{bm ? 'Maklum balas AI sedang disediakan' : 'AI feedback is being prepared'}</Text>
          <Text style={styles.muted}>
            {bm ? 'Rakaman anda telah disimpan. Ini mungkin ambil beberapa minit.' : 'Your session is saved. This can take a few minutes.'}
          </Text>
          {!!error && <Text style={styles.warn}>{bm ? 'Menyambung semula…' : 'Reconnecting…'}</Text>}
        </View>
      </View>
    );
  }

  if (status === 'failed' || status === 'skipped' || !session?.ai_feedback) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>{bm ? 'Maklum balas AI tidak tersedia' : 'AI feedback is not available'}</Text>
        <Text style={styles.muted}>
          {session?.ai_error ?? (bm ? 'Sesi anda telah disimpan.' : 'Your session was saved.')}
        </Text>
      </View>
    );
  }

  const f = session.ai_feedback;
  const list = (heading: string, items: string[]) =>
    items.length > 0 ? (
      <View style={styles.block}>
        <Text style={styles.heading}>{heading}</Text>
        {items.map((t, i) => (
          <Text key={i} style={styles.item}>
            • {t}
          </Text>
        ))}
      </View>
    ) : null;

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Ionicons name="sparkles" size={16} color={ACCENT} />
        <Text style={[styles.title, { marginLeft: 6 }]}>{bm ? 'Maklum balas AI' : 'AI feedback'}</Text>
      </View>

      <View style={f.is_mock ? styles.mockBanner : styles.noteBanner}>
        <Text style={f.is_mock ? styles.mockText : styles.noteText}>
          {f.is_mock
            ? bm ? 'Contoh sahaja. AI belum dikonfigurasi, ini bukan berdasarkan rakaman anda.' : 'Sample only. AI is not configured, so this is not based on your recording.'
            : bm ? 'Draf yang dijana AI. Semak bersama penyelia anda; ia bukan penilaian rasmi.' : 'AI-generated draft. Review it with your supervisor; it is not an official assessment.'}
        </Text>
      </View>

      {!!f.summary && <Text style={styles.summary}>{f.summary}</Text>}
      {list(bm ? 'Kekuatan' : 'Strengths', f.strengths)}
      {list(bm ? 'Untuk dibaiki' : 'Areas to improve', f.areas_to_improve)}
      {list(bm ? 'Kemahiran diperhatikan' : 'Skills observed', f.skills_observed)}
      {list(bm ? 'Perkara etika untuk disemak' : 'Ethical points to check', f.ethical_flags)}
      {list(bm ? 'Soalan untuk penyeliaan' : 'Questions for supervision', f.questions_for_supervision)}

      {!!session.transcript && (
        <TouchableOpacity onPress={() => setShowTranscript((v) => !v)} activeOpacity={0.7} style={{ marginTop: 10 }}>
          <Text style={styles.link}>{showTranscript ? (bm ? 'Sembunyi transkrip' : 'Hide transcript') : bm ? 'Tunjuk transkrip' : 'Show transcript'}</Text>
          {showTranscript && <Text style={styles.transcript}>{session.transcript}</Text>}
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  row: { flexDirection: 'row', alignItems: 'center' },
  title: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  muted: { fontSize: 12, color: '#64748B', marginTop: 4, lineHeight: 17 },
  warn: { fontSize: 11, color: '#B45309', marginTop: 4 },
  summary: { fontSize: 13, color: '#0F172A', lineHeight: 19, marginTop: 10 },
  block: { marginTop: 10 },
  heading: { fontSize: 12, fontWeight: '700', color: ACCENT, marginBottom: 3 },
  item: { fontSize: 12, color: '#334155', lineHeight: 18 },
  noteBanner: { backgroundColor: '#F3E8FF', borderRadius: 8, padding: 8, marginTop: 8 },
  noteText: { fontSize: 11, color: '#5B21B6', lineHeight: 15 },
  mockBanner: { backgroundColor: '#FEF3C7', borderRadius: 8, padding: 8, marginTop: 8 },
  mockText: { fontSize: 11, color: '#92400E', lineHeight: 15 },
  link: { fontSize: 12, fontWeight: '700', color: ACCENT },
  transcript: { fontSize: 12, color: '#475569', lineHeight: 18, marginTop: 6 },
});
