import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export type CaseStatus = 'draft' | 'submitted' | 'reviewed' | 'revision';

export interface CaseAnalysis {
  id: string;
  caseRef: string; // de-identified code, never a client name
  focus: string; // short de-identified description of the presenting concern
  updated: string; // ISO date
  status: CaseStatus;
  sessionsLinked: number; // sessions from Individual/Group Counseling attached to this case
  sectionsDone: number; // completed sections of the case conceptualization
  sectionsTotal: number;
  aiAssisted: boolean; // an AI draft was used in at least one section
  rating?: number; // supervisor rating once reviewed (TODO: confirm scale with the programme)
}

interface CaseCardProps {
  item: CaseAnalysis;
  lang: 'BM' | 'EN';
  onPress: () => void;
}

const STATUS_STYLE: Record<CaseStatus, { color: string; bm: string; en: string }> = {
  draft: { color: '#64748B', bm: 'Draf', en: 'Draft' },
  submitted: { color: '#D97706', bm: 'Menunggu semakan', en: 'Awaiting review' },
  reviewed: { color: '#059669', bm: 'Disemak', en: 'Reviewed' },
  revision: { color: '#DC2626', bm: 'Perlu semakan semula', en: 'Needs revision' },
};

export default function CaseCard({ item, lang, onPress }: CaseCardProps) {
  const status = STATUS_STYLE[item.status];
  const locale = lang === 'BM' ? 'ms-MY' : 'en-MY';
  const updatedText = new Date(item.updated).toLocaleDateString(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const progress = item.sectionsTotal > 0 ? item.sectionsDone / item.sectionsTotal : 0;

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.7} onPress={onPress}>
      <View style={styles.topRow}>
        <Text style={styles.caseRef}>{`${lang === 'BM' ? 'Kes' : 'Case'} ${item.caseRef}`}</Text>
        <View style={styles.badges}>
          {item.aiAssisted && (
            <View style={styles.aiBadge}>
              <Ionicons name="sparkles" size={10} color="#7C3AED" />
              <Text style={styles.aiBadgeText}>AI</Text>
            </View>
          )}
          <View style={[styles.chip, { backgroundColor: status.color + '18' }]}>
            <Text style={[styles.chipText, { color: status.color }]}>
              {lang === 'BM' ? status.bm : status.en}
            </Text>
          </View>
        </View>
      </View>

      <Text style={styles.focus} numberOfLines={2}>
        {item.focus}
      </Text>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>

      <View style={styles.bottomRow}>
        <Text style={styles.meta}>
          {item.sectionsDone}/{item.sectionsTotal} {lang === 'BM' ? 'bahagian' : 'sections'} ·{' '}
          {item.sessionsLinked} {lang === 'BM' ? 'sesi' : 'sessions'}
        </Text>
        {item.rating !== undefined ? (
          <View style={styles.rating}>
            <Ionicons name="star" size={12} color="#CA8A04" />
            <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
          </View>
        ) : (
          <Text style={styles.meta}>{updatedText}</Text>
        )}
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
  caseRef: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  badges: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 999,
  },
  aiBadgeText: { fontSize: 10, fontWeight: '700', color: '#7C3AED' },
  chip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  chipText: { fontSize: 11, fontWeight: '700' },
  focus: { fontSize: 12, color: '#475569', lineHeight: 17, marginTop: 8 },
  progressTrack: { height: 6, borderRadius: 3, backgroundColor: '#E2E8F0', marginTop: 12, overflow: 'hidden' },
  progressFill: { height: 6, borderRadius: 3, backgroundColor: '#7C3AED' },
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  meta: { fontSize: 11, color: '#64748B' },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  ratingText: { fontSize: 12, fontWeight: '700', color: '#0F172A' },
});
