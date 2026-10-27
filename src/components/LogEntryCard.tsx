import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export type LogStatus = 'draft' | 'submitted' | 'approved' | 'returned';
export type LogCategory = 'individual' | 'group' | 'supervision' | 'other';

export interface LogEntry {
  id: string;
  date: string; // ISO date, e.g. '2026-10-27'
  hours: number;
  category: LogCategory;
  caseRef?: string; // de-identified code, never a client name
  status: LogStatus;
}

interface LogEntryCardProps {
  entry: LogEntry;
  lang: 'BM' | 'EN';
  onPress: () => void;
}

const STATUS_STYLE: Record<LogStatus, { color: string; bm: string; en: string }> = {
  draft: { color: '#64748B', bm: 'Draf', en: 'Draft' },
  submitted: { color: '#D97706', bm: 'Dihantar', en: 'Submitted' },
  approved: { color: '#059669', bm: 'Diluluskan', en: 'Approved' },
  returned: { color: '#DC2626', bm: 'Dipulangkan', en: 'Returned' },
};

const CATEGORY_LABEL: Record<LogCategory, { bm: string; en: string; icon: keyof typeof Ionicons.glyphMap }> = {
  individual: { bm: 'Kaunseling Individu', en: 'Individual counseling', icon: 'person-outline' },
  group: { bm: 'Kaunseling Kumpulan', en: 'Group counseling', icon: 'people-outline' },
  supervision: { bm: 'Penyeliaan', en: 'Supervision', icon: 'school-outline' },
  other: { bm: 'Lain-lain', en: 'Other', icon: 'ellipsis-horizontal-outline' },
};

export default function LogEntryCard({ entry, lang, onPress }: LogEntryCardProps) {
  const status = STATUS_STYLE[entry.status];
  const category = CATEGORY_LABEL[entry.category];
  const locale = lang === 'BM' ? 'ms-MY' : 'en-MY';
  const dateText = new Date(entry.date).toLocaleDateString(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.7} onPress={onPress}>
      <View style={styles.topRow}>
        <Text style={styles.date}>{dateText}</Text>
        <View style={[styles.chip, { backgroundColor: status.color + '18' }]}>
          <Text style={[styles.chipText, { color: status.color }]}>
            {lang === 'BM' ? status.bm : status.en}
          </Text>
        </View>
      </View>

      <View style={styles.midRow}>
        <Ionicons name={category.icon} size={16} color="#64748B" />
        <Text style={styles.category}>{lang === 'BM' ? category.bm : category.en}</Text>
      </View>

      <View style={styles.bottomRow}>
        <Text style={styles.caseRef}>{entry.caseRef ? `${lang === 'BM' ? 'Kes' : 'Case'}: ${entry.caseRef}` : ''}</Text>
        <Text style={styles.hours}>
          {entry.hours.toFixed(1)} {lang === 'BM' ? 'jam' : 'hrs'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  date: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  chip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  chipText: { fontSize: 11, fontWeight: '700' },
  midRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  category: { fontSize: 12, color: '#475569' },
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  caseRef: { fontSize: 11, color: '#64748B' },
  hours: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
});
