import Header from '@/components/Header';
import { useLanguage } from '@/context/LanguageContext';
import { translations } from '@/context/localization';
import type { Criterion, Evaluation } from '@/data/mock/fullMark';
import { useLoad } from '@/hooks/use-load';
import { fetchEvaluation, fetchRubric, submitEvaluation } from '@/services/full-mark';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ACCENT = '#CA8A04';

export default function EvaluationScreen() {
  const { id, superviseeId } = useLocalSearchParams<{ id: string; superviseeId?: string }>();
  return id === 'new' ? <ScoreForm superviseeId={Number(superviseeId)} /> : <EvaluationDetail id={Number(id)} />;
}

function ScoreForm({ superviseeId }: { superviseeId: number }) {
  const { lang } = useLanguage();
  const router = useRouter();
  const bm = lang === 'BM';
  const rubric = useLoad<Criterion[]>(fetchRubric, []);
  const [marks, setMarks] = useState<Record<number, string>>({});
  const [remarks, setRemarks] = useState<Record<number, string>>({});
  const [comments, setComments] = useState('');
  const [saving, setSaving] = useState(false);

  const maxTotal = rubric.data.reduce((s, c) => s + c.max_marks, 0);
  const total = rubric.data.reduce((s, c) => s + (Number(marks[c.id]) || 0), 0);

  const submit = async () => {
    const scores = [];
    for (const c of rubric.data) {
      const raw = (marks[c.id] ?? '').trim();
      const value = Number(raw);
      if (raw === '' || Number.isNaN(value) || value < 0 || value > c.max_marks) {
        Alert.alert(
          bm ? 'Markah tidak sah' : 'Invalid marks',
          `${c.name}: 0 - ${c.max_marks}`,
        );
        return;
      }
      scores.push({ criterion_id: c.id, marks: value, remarks: (remarks[c.id] ?? '').trim() || null });
    }
    setSaving(true);
    try {
      await submitEvaluation(superviseeId, comments.trim() || null, scores);
      router.back();
    } catch (e) {
      Alert.alert(bm ? 'Gagal menghantar' : 'Could not submit', e instanceof Error ? e.message : undefined);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header subtitle={translations[lang].fullMarkTitle} />
      {rubric.loading ? (
        <ActivityIndicator style={styles.empty} color={ACCENT} />
      ) : rubric.data.length === 0 ? (
        <Text style={styles.empty}>
          {bm ? 'Rubrik belum disediakan. Hubungi admin.' : 'No rubric is set up yet. Ask an admin.'}
        </Text>
      ) : (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <View style={styles.totalCard}>
              <Text style={styles.totalValue}>
                {total} <Text style={styles.totalMax}>/ {maxTotal}</Text>
              </Text>
              <Text style={styles.totalLabel}>{bm ? 'Jumlah markah' : 'Total marks'}</Text>
            </View>

            {rubric.data.map((c) => (
              <View key={c.id} style={styles.card}>
                <Text style={styles.cardTitle}>{c.name}</Text>
                {!!c.description && <Text style={styles.cardMeta}>{c.description}</Text>}
                <View style={styles.markRow}>
                  <TextInput
                    style={[styles.input, styles.markInput]}
                    value={marks[c.id] ?? ''}
                    onChangeText={(t) => setMarks((p) => ({ ...p, [c.id]: t }))}
                    keyboardType="decimal-pad"
                    placeholder="0"
                    placeholderTextColor="#94A3B8"
                  />
                  <Text style={styles.markOf}>/ {c.max_marks}</Text>
                </View>
                <TextInput
                  style={[styles.input, { marginTop: 8 }]}
                  value={remarks[c.id] ?? ''}
                  onChangeText={(t) => setRemarks((p) => ({ ...p, [c.id]: t }))}
                  placeholder={bm ? 'Catatan (pilihan)' : 'Remarks (optional)'}
                  placeholderTextColor="#94A3B8"
                />
              </View>
            ))}

            <Text style={styles.label}>{bm ? 'Komen keseluruhan' : 'Overall comments'}</Text>
            <TextInput
              style={[styles.input, { minHeight: 90 }]}
              value={comments}
              onChangeText={setComments}
              multiline
              textAlignVertical="top"
              placeholderTextColor="#94A3B8"
            />

            <TouchableOpacity
              style={[styles.primary, saving && { opacity: 0.5 }]}
              disabled={saving}
              onPress={submit}
              activeOpacity={0.8}
            >
              {saving ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryText}>{bm ? 'Hantar penilaian' : 'Submit evaluation'}</Text>}
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}

function EvaluationDetail({ id }: { id: number }) {
  const { lang } = useLanguage();
  const bm = lang === 'BM';
  const { data, loading, error } = useLoad<Evaluation | null>(() => fetchEvaluation(id), null);

  return (
    <SafeAreaView style={styles.container}>
      <Header subtitle={translations[lang].fullMarkTitle} />
      {loading ? (
        <ActivityIndicator style={styles.empty} color={ACCENT} />
      ) : !data ? (
        <Text style={styles.empty}>{error ?? (bm ? 'Rekod tidak ditemui.' : 'Record not found.')}</Text>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.totalCard}>
            <Text style={styles.totalValue}>{data.percent}%</Text>
            <Text style={styles.totalLabel}>
              {data.total_marks} / {data.max_total} · {data.supervisee_name}
            </Text>
            <Text style={styles.totalLabel}>
              {(data.created_at ?? '').slice(0, 10)} · {bm ? 'oleh' : 'by'} {data.evaluator_name}
            </Text>
          </View>

          {data.scores.map((s) => (
            <View key={s.criterion_id} style={styles.card}>
              <View style={styles.markRow}>
                <Text style={[styles.cardTitle, { flex: 1 }]}>{s.criterion_name}</Text>
                <Text style={styles.detailMark}>
                  {s.marks} / {s.max_marks}
                </Text>
              </View>
              {!!s.remarks && <Text style={styles.cardMeta}>{s.remarks}</Text>}
            </View>
          ))}

          {!!data.comments && (
            <View style={styles.feedback}>
              <Text style={styles.feedbackTitle}>{bm ? 'Komen penyelia' : 'Supervisor comments'}</Text>
              <Text style={styles.feedbackText}>{data.comments}</Text>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0F19' },
  content: { padding: 16, paddingBottom: 48 },
  empty: { textAlign: 'center', color: '#94A3B8', marginTop: 32, paddingHorizontal: 24 },
  totalCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 18, alignItems: 'center', marginBottom: 14 },
  totalValue: { fontSize: 32, fontWeight: '700', color: ACCENT },
  totalMax: { fontSize: 16, color: '#64748B', fontWeight: '600' },
  totalLabel: { fontSize: 12, color: '#64748B', marginTop: 2 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 12 },
  cardTitle: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  cardMeta: { fontSize: 12, color: '#64748B', marginTop: 4, lineHeight: 16 },
  markRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  markInput: { width: 90, textAlign: 'center' },
  markOf: { fontSize: 14, fontWeight: '600', color: '#475569' },
  detailMark: { fontSize: 15, fontWeight: '700', color: ACCENT },
  input: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: '#0F172A' },
  label: { fontSize: 12, fontWeight: '700', color: '#CBD5E1', marginBottom: 6, marginTop: 8 },
  primary: { backgroundColor: ACCENT, borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: 20 },
  primaryText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  feedback: { backgroundColor: '#FEF3C7', borderRadius: 12, padding: 14, marginTop: 4 },
  feedbackTitle: { fontSize: 13, fontWeight: '700', color: '#92400E', marginBottom: 4 },
  feedbackText: { fontSize: 12, color: '#92400E', lineHeight: 17 },
});
