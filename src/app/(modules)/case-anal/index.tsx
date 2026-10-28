import Header from '@/components/Header';
import CaseCard, { CaseStatus } from '@/components/modules/CaseCard';
import { useLanguage } from '@/context/LanguageContext';
import { translations } from '@/context/localization';
import { MOCK_CASES } from '@/data/mock/caseAnal';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Filter = 'all' | CaseStatus;

const FILTERS: { key: Filter; bm: string; en: string }[] = [
  { key: 'all', bm: 'Semua', en: 'All' },
  { key: 'draft', bm: 'Draf', en: 'Draft' },
  { key: 'submitted', bm: 'Menunggu', en: 'Awaiting' },
  { key: 'reviewed', bm: 'Disemak', en: 'Reviewed' },
  { key: 'revision', bm: 'Semakan semula', en: 'Revision' },
];

export default function CaseAnalysisScreen() {
  const { lang } = useLanguage();
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>('all');
  const cases = MOCK_CASES;

  const counts = useMemo(
    () => ({
      total: cases.length,
      awaiting: cases.filter((c) => c.status === 'submitted').length,
      revision: cases.filter((c) => c.status === 'revision').length,
    }),
    [cases],
  );
  const visible = filter === 'all' ? cases : cases.filter((c) => c.status === filter);

  const stat = (value: number, label: string, color: string) => (
    <View style={styles.stat}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  const header = (
    <>
      <View style={styles.summaryCard}>
        {stat(counts.total, lang === 'BM' ? 'Jumlah kes' : 'Total cases', '#0F172A')}
        {stat(counts.awaiting, lang === 'BM' ? 'Menunggu semakan' : 'Awaiting review', '#D97706')}
        {stat(counts.revision, lang === 'BM' ? 'Perlu semakan semula' : 'Needs revision', '#DC2626')}
      </View>

      <View style={styles.privacyNote}>
        <Ionicons name="shield-checkmark-outline" size={16} color="#7C3AED" />
        <Text style={styles.privacyText}>
          {lang === 'BM'
            ? 'Gunakan kod kes sahaja. Jangan masukkan nama atau maklumat pengenalan klien.'
            : 'Use case codes only. Do not enter client names or identifying details.'}
        </Text>
      </View>

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
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header subtitle={translations[lang].caseAnalTitle} />
      <FlatList
        data={visible}
        keyExtractor={(c) => c.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={header}
        ListEmptyComponent={
          <Text style={styles.empty}>{lang === 'BM' ? 'Tiada kes.' : 'No cases yet.'}</Text>
        }
        renderItem={({ item }) => (
          <CaseCard
            item={item}
            lang={lang as 'BM' | 'EN'}
            onPress={() => router.push({ pathname: '/case-anal/[id]', params: { id: item.id } })}
          />
        )}
      />
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.8}
        onPress={() => router.push({ pathname: '/case-anal/[id]', params: { id: 'new' } })}
      >
        <Ionicons name="add" size={26} color="#FFFFFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0F19' },
  list: { padding: 16, paddingBottom: 96 },
  summaryCard: {flexDirection: 'row',backgroundColor: '#FFFFFF',borderRadius: 16,padding: 16,borderWidth: 1,borderColor: '#E2E8F0',marginBottom: 12,},
  stat: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 24, fontWeight: '700' },
  statLabel: { fontSize: 11, color: '#64748B', marginTop: 2, textAlign: 'center' },
  privacyNote: {flexDirection: 'row',alignItems: 'center',gap: 8,backgroundColor: '#F3E8FF',borderRadius: 12,padding: 12,marginBottom: 14,},
  privacyText: { flex: 1, fontSize: 12, color: '#5B21B6', lineHeight: 16 },
  filterRow: { gap: 8, paddingBottom: 14 },
  filterChip: {paddingHorizontal: 14,paddingVertical: 7,borderRadius: 999,backgroundColor: '#FFFFFF',borderWidth: 1,borderColor: '#E2E8F0',},
  filterChipActive: { backgroundColor: '#7C3AED', borderColor: '#7C3AED' },
  filterText: { fontSize: 12, fontWeight: '600', color: '#475569' },
  filterTextActive: { color: '#FFFFFF' },
  empty: { textAlign: 'center', color: '#64748B', marginTop: 32 },
  fab: {position: 'absolute',right: 20,bottom: 28,width: 56,height: 56,borderRadius: 28,backgroundColor: '#7C3AED',justifyContent: 'center',alignItems: 'center',elevation: 4,shadowColor: '#000',shadowOffset: { width: 0, height: 2 },shadowOpacity: 0.2,shadowRadius: 4,},
});
