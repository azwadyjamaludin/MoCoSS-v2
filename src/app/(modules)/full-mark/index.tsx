import Header from '@/components/Header';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { translations } from '@/context/localization';
import { DEV_APP } from '@/data/dev-app';
import type { Evaluation, Supervisee } from '@/data/mock/fullMark';
import { useLoad } from '@/hooks/use-load';
import { fetchEvaluations, fetchSupervisees } from '@/services/full-mark';
import { Href, useRouter } from 'expo-router';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ACCENT = '#CA8A04';

export default function FullMarkScreen() {
  const { lang } = useLanguage();
  const { user } = useAuth();
  const router = useRouter();
  const bm = lang === 'BM';

  const role = user?.role ?? '';
  const canEvaluate = role === 'supervisor' || role === 'field supervisor' || DEV_APP;

  const evals = useLoad<Evaluation[]>(fetchEvaluations, []);
  const supervisees = useLoad<Supervisee[]>(() => (canEvaluate ? fetchSupervisees() : Promise.resolve([])), []);

  const header = canEvaluate ? (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{bm ? 'Penyelia anda' : 'Your supervisees'}</Text>
      {supervisees.loading ? (
        <ActivityIndicator color={ACCENT} />
      ) : supervisees.data.length === 0 ? (
        <Text style={styles.muted}>
          {supervisees.error
            ? bm ? 'Tidak dapat memuatkan senarai.' : 'Could not load the list.'
            : bm ? 'Tiada kaunselor ditugaskan kepada anda lagi.' : 'No counselors are assigned to you yet.'}
        </Text>
      ) : (
        supervisees.data.map((s) => (
          <View key={s.id} style={styles.superviseeRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{s.full_name ?? s.email}</Text>
              <Text style={styles.cardMeta}>{s.email}</Text>
            </View>
            <TouchableOpacity
              style={styles.evalButton}
              activeOpacity={0.8}
              onPress={() => router.push(`/full-mark/new?superviseeId=${s.id}` as Href)}
            >
              <Text style={styles.evalButtonText}>{bm ? 'Nilai' : 'Evaluate'}</Text>
            </TouchableOpacity>
          </View>
        ))
      )}
      <Text style={[styles.sectionTitle, { marginTop: 20 }]}>{bm ? 'Penilaian terdahulu' : 'Past evaluations'}</Text>
    </View>
  ) : null;

  return (
    <SafeAreaView style={styles.container}>
      <Header subtitle={translations[lang].fullMarkTitle} />
      <FlatList
        data={evals.data}
        keyExtractor={(e) => String(e.id)}
        contentContainerStyle={styles.list}
        ListHeaderComponent={header}
        ListEmptyComponent={
          evals.loading ? (
            <ActivityIndicator style={styles.empty} color={ACCENT} />
          ) : (
            <Text style={styles.empty}>
              {evals.error ? (bm ? 'Tidak dapat memuatkan penilaian.' : 'Could not load evaluations.') : bm ? 'Tiada penilaian lagi.' : 'No evaluations yet.'}
            </Text>
          )
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.8}
            onPress={() => router.push(`/full-mark/${item.id}` as Href)}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{item.supervisee_name ?? '-'}</Text>
              <Text style={styles.cardMeta}>
                {(item.created_at ?? '').slice(0, 10)} · {bm ? 'oleh' : 'by'} {item.evaluator_name ?? '-'}
              </Text>
            </View>
            <View style={styles.markBox}>
              <Text style={styles.markValue}>{item.percent}%</Text>
              <Text style={styles.markSub}>
                {item.total_marks}/{item.max_total}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0F19' },
  list: { padding: 16, paddingBottom: 48 },
  section: { marginBottom: 4 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#CBD5E1', marginBottom: 10 },
  muted: { fontSize: 12, color: '#94A3B8' },
  empty: { textAlign: 'center', color: '#94A3B8', marginTop: 24 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  superviseeRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 14, marginBottom: 10 },
  cardTitle: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  cardMeta: { fontSize: 11, color: '#64748B', marginTop: 2 },
  evalButton: { backgroundColor: ACCENT, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999 },
  evalButtonText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  markBox: { alignItems: 'flex-end' },
  markValue: { fontSize: 20, fontWeight: '700', color: ACCENT },
  markSub: { fontSize: 11, color: '#64748B' },
});
