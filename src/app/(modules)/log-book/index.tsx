import LogEntryCard, { LogEntry, LogStatus } from '@/components/modules/LogEntryCard';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../../components/Header';
import { useLanguage } from '../../../context/LanguageContext';
import { translations } from '../../../context/localization';

// TODO: replace with the real requirement from the programme / board.
const TARGET_HOURS = 100;

// TODO: replace with data from the backend (e.g. GET /api/logBook/entries).
const MOCK_ENTRIES: LogEntry[] = [
  { id: '1', date: '2026-10-20', hours: 1.5, category: 'individual', caseRef: 'C-014', status: 'approved' },
  { id: '2', date: '2026-10-22', hours: 2, category: 'group', caseRef: 'G-003', status: 'submitted' },
  { id: '3', date: '2026-10-25', hours: 1, category: 'supervision', status: 'returned' },
  { id: '4', date: '2026-10-27', hours: 1.5, category: 'individual', caseRef: 'C-015', status: 'draft' },
];

type Filter = 'all' | LogStatus;

const FILTERS: { key: Filter; bm: string; en: string }[] = [
  { key: 'all', bm: 'Semua', en: 'All' },
  { key: 'draft', bm: 'Draf', en: 'Draft' },
  { key: 'submitted', bm: 'Dihantar', en: 'Submitted' },
  { key: 'approved', bm: 'Diluluskan', en: 'Approved' },
  { key: 'returned', bm: 'Dipulangkan', en: 'Returned' },
];

export default function LogBookScreen() {
  const { lang } = useLanguage();
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>('all');
  const entries = MOCK_ENTRIES;

  const approvedHours = useMemo(
    () => entries.filter((e) => e.status === 'approved').reduce((sum, e) => sum + e.hours, 0),
    [entries],
  );
  const pendingHours = useMemo(
    () => entries.filter((e) => e.status === 'submitted').reduce((sum, e) => sum + e.hours, 0),
    [entries],
  );
  const visible = filter === 'all' ? entries : entries.filter((e) => e.status === filter);
  const progress = Math.min(approvedHours / TARGET_HOURS, 1);

  const summary = (
    <View style={styles.summaryCard}>
      <Text style={styles.summaryLabel}>{lang === 'BM' ? 'Jam diluluskan' : 'Approved hours'}</Text>
      <Text style={styles.summaryValue}>
        {approvedHours.toFixed(1)} <Text style={styles.summaryTarget}>/ {TARGET_HOURS}</Text>
      </Text>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>
      <Text style={styles.summaryNote}>
        {lang === 'BM' ? 'Menunggu kelulusan' : 'Awaiting approval'}: {pendingHours.toFixed(1)}{' '}
        {lang === 'BM' ? 'jam' : 'hrs'}
      </Text>
    </View>
  );

  const filters = (
    <FlatList
      horizontal
      data={FILTERS}
      keyExtractor={(f) => f.key}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.filterRow}
      renderItem={({ item }) => {
        const active = item.key === filter;
        return (
          <TouchableOpacity
            style={[styles.filterChip, active && styles.filterChipActive]}
            onPress={() => setFilter(item.key)}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterText, active && styles.filterTextActive]}>
              {lang === 'BM' ? item.bm : item.en}
            </Text>
          </TouchableOpacity>
        );
      }}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header subtitle={translations[lang].logBookTitle} />
      <FlatList
        data={visible}
        keyExtractor={(e) => e.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View>
            {summary}
            {filters}
          </View>
        }
        ListEmptyComponent={
          <Text style={styles.empty}>{lang === 'BM' ? 'Tiada catatan.' : 'No entries yet.'}</Text>
        }
        renderItem={({ item }) => (
          <LogEntryCard
            entry={item}
            lang={lang as 'BM' | 'EN'}
            onPress={() => router.push({ pathname: '/log-book/[id]', params: { id: item.id } })}
          />
        )}
      />
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.8}
        onPress={() => router.push({ pathname: '/log-book/[id]', params: { id: 'new' } })}
      >
        <Ionicons name="add" size={26} color="#FFFFFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0F19' },
  list: { padding: 16, paddingBottom: 96 },
  summaryCard: {backgroundColor: '#FFFFFF',borderRadius: 16,padding: 16,borderWidth: 1,borderColor: '#E2E8F0',marginBottom: 14,},
  summaryLabel: { fontSize: 12, color: '#64748B' },
  summaryValue: { fontSize: 28, fontWeight: '700', color: '#0F172A', marginTop: 4 },
  summaryTarget: { fontSize: 16, fontWeight: '500', color: '#64748B' },
  progressTrack: { height: 8, borderRadius: 4, backgroundColor: '#E2E8F0', marginTop: 10, overflow: 'hidden' },
  progressFill: { height: 8, borderRadius: 4, backgroundColor: '#D97706' },
  summaryNote: { fontSize: 11, color: '#64748B', marginTop: 8 },
  filterRow: { gap: 8, paddingBottom: 14 },
  filterChip: {paddingHorizontal: 14,paddingVertical: 7,borderRadius: 999,backgroundColor: '#FFFFFF',borderWidth: 1,borderColor: '#E2E8F0',},
  filterChipActive: { backgroundColor: '#D97706', borderColor: '#D97706' },
  filterText: { fontSize: 12, fontWeight: '600', color: '#475569' },
  filterTextActive: { color: '#FFFFFF' },
  empty: { textAlign: 'center', color: '#64748B', marginTop: 32 },
  fab: {position: 'absolute',right: 20,bottom: 28,width: 56,height: 56,borderRadius: 28,backgroundColor: '#D97706',justifyContent: 'center',alignItems: 'center',elevation: 4,shadowColor: '#000',shadowOffset: { width: 0, height: 2 },shadowOpacity: 0.2,shadowRadius: 4,},
});
