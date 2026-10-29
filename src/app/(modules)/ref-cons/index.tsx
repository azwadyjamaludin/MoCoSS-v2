import Header from '@/components/Header';
import RefConsCard, { RefConsKind } from '@/components/modules/RefConsCard';
import { useLanguage } from '@/context/LanguageContext';
import { translations } from '@/context/localization';
import { MOCK_REFCONS } from '@/data/mock/refCons';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Filter = 'all' | RefConsKind;

export default function RefConsListScreen() {
  const { lang } = useLanguage();
  const router = useRouter();
  const bm = lang === 'BM';
  const [filter, setFilter] = useState<Filter>('all');
  const items = MOCK_REFCONS;

  const counts = useMemo(
    () => ({
      open: items.filter((i) => i.status === 'draft' || i.status === 'submitted').length,
      responded: items.filter((i) => i.status === 'responded').length,
      urgent: items.filter((i) => i.urgent && i.status !== 'closed').length,
    }),
    [items],
  );
  const visible = filter === 'all' ? items : items.filter((i) => i.kind === filter);

  const filters: { key: Filter; label: string }[] = [
    { key: 'all', label: bm ? 'Semua' : 'All' },
    { key: 'consultation', label: bm ? 'Konsultasi' : 'Consultations' },
    { key: 'referral', label: bm ? 'Rujukan' : 'Referrals' },
  ];

  const openItem = (id: string) => router.push({ pathname: '/ref-cons/[id]', params: { id } });
  const createItem = (kind: RefConsKind) =>
    router.push({ pathname: '/ref-cons/[id]', params: { id: 'new', kind } });

  const askKind = () =>
    Alert.alert(bm ? 'Buat baharu' : 'Create new', undefined, [
      { text: bm ? 'Konsultasi reflektif' : 'Reflective consultation', onPress: () => createItem('consultation') },
      { text: bm ? 'Rujukan klien' : 'Client referral', onPress: () => createItem('referral') },
      { text: bm ? 'Batal' : 'Cancel', style: 'cancel' },
    ]);

  const stat = (value: number, label: string, color: string) => (
    <View style={styles.stat}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  const header = (
    <>
      <View style={styles.summaryCard}>
        {stat(counts.open, bm ? 'Belum selesai' : 'Open', '#D97706')}
        {stat(counts.responded, bm ? 'Ada maklum balas' : 'Responded', '#2563EB')}
        {stat(counts.urgent, bm ? 'Segera' : 'Urgent', '#DC2626')}
      </View>

      <View style={styles.segment}>
        {filters.map((f) => {
          const active = f.key === filter;
          return (
            <TouchableOpacity
              key={f.key}
              style={[styles.segmentButton, active && styles.segmentButtonActive]}
              onPress={() => setFilter(f.key)}
              activeOpacity={0.7}
            >
              <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{f.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header subtitle={translations[lang].refConsTitle} />
      <FlatList
        data={visible}
        keyExtractor={(i) => i.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={header}
        ListEmptyComponent={<Text style={styles.empty}>{bm ? 'Tiada rekod.' : 'Nothing here yet.'}</Text>}
        renderItem={({ item }) => (
          <RefConsCard item={item} lang={lang as 'BM' | 'EN'} onPress={() => openItem(item.id)} />
        )}
      />
      <TouchableOpacity style={styles.fab} activeOpacity={0.8} onPress={askKind}>
        <Ionicons name="add" size={26} color="#FFFFFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0F19' },
  list: { padding: 16, paddingBottom: 96 },
  summaryCard: {flexDirection: 'row',backgroundColor: '#FFFFFF',borderRadius: 16,padding: 16,borderWidth: 1,borderColor: '#E2E8F0',marginBottom: 14,},
  stat: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 24, fontWeight: '700' },
  statLabel: { fontSize: 11, color: '#64748B', marginTop: 2, textAlign: 'center' },
  segment: {flexDirection: 'row',backgroundColor: '#E2E8F0',borderRadius: 12,padding: 3,marginBottom: 14,},
  segmentButton: { flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: 'center' },
  segmentButtonActive: { backgroundColor: '#FFFFFF' },
  segmentText: { fontSize: 12, fontWeight: '600', color: '#64748B' },
  segmentTextActive: { color: '#DC2626' },
  empty: { textAlign: 'center', color: '#94A3B8', marginTop: 32 },
  fab: {position: 'absolute',right: 20,bottom: 28,width: 56,height: 56,borderRadius: 28,backgroundColor: '#DC2626',justifyContent: 'center',alignItems: 'center',elevation: 4,shadowColor: '#000',shadowOffset: { width: 0, height: 2 },shadowOpacity: 0.2,shadowRadius: 4,},
});
