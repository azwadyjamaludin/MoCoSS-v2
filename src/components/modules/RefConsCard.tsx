import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export type RefConsKind = 'consultation' | 'referral';
export type RefConsStatus = 'draft' | 'submitted' | 'responded' | 'closed';

export interface RefConsItem {
  id: string;
  kind: RefConsKind;
  topic: string; // short de-identified title
  caseRef?: string; // de-identified code, never a client name
  target: string; // consultant role (consultation) or referred-to service (referral)
  updated: string; // ISO date
  status: RefConsStatus;
  urgent?: boolean; // referrals only
  ethical?: boolean; // consultations only: flagged as an ethical dilemma
}

interface RefConsCardProps {
  item: RefConsItem;
  lang: 'BM' | 'EN';
  onPress: () => void;
}

export const REFCONS_STATUS: Record<RefConsStatus, { color: string; bm: string; en: string }> = {
  draft: { color: '#64748B', bm: 'Draf', en: 'Draft' },
  submitted: { color: '#D97706', bm: 'Dihantar', en: 'Sent' },
  responded: { color: '#2563EB', bm: 'Ada maklum balas', en: 'Responded' },
  closed: { color: '#059669', bm: 'Selesai', en: 'Closed' },
};

export default function RefConsCard({ item, lang, onPress }: RefConsCardProps) {
  const status = REFCONS_STATUS[item.status];
  const isReferral = item.kind === 'referral';
  const locale = lang === 'BM' ? 'ms-MY' : 'en-MY';
  const updatedText = new Date(item.updated).toLocaleDateString(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.7} onPress={onPress}>
      <View style={styles.topRow}>
        <View style={styles.kindRow}>
          <Ionicons
            name={isReferral ? 'git-network-outline' : 'chatbubbles-outline'}
            size={16}
            color="#DC2626"
          />
          <Text style={styles.kind}>
            {isReferral ? (lang === 'BM' ? 'Rujukan' : 'Referral') : lang === 'BM' ? 'Konsultasi' : 'Consultation'}
          </Text>
        </View>
        <View style={[styles.chip, { backgroundColor: status.color + '18' }]}>
          <Text style={[styles.chipText, { color: status.color }]}>{lang === 'BM' ? status.bm : status.en}</Text>
        </View>
      </View>

      <Text style={styles.topic} numberOfLines={2}>
        {item.topic}
      </Text>

      <View style={styles.flagRow}>
        {item.urgent && (
          <View style={[styles.flag, { backgroundColor: '#FEE2E2' }]}>
            <Text style={[styles.flagText, { color: '#B91C1C' }]}>{lang === 'BM' ? 'Segera' : 'Urgent'}</Text>
          </View>
        )}
        {item.ethical && (
          <View style={[styles.flag, { backgroundColor: '#F3E8FF' }]}>
            <Text style={[styles.flagText, { color: '#7C3AED' }]}>{lang === 'BM' ? 'Isu etika' : 'Ethical issue'}</Text>
          </View>
        )}
      </View>

      <View style={styles.bottomRow}>
        <Text style={styles.meta} numberOfLines={1}>
          {item.caseRef ? `${lang === 'BM' ? 'Kes' : 'Case'} ${item.caseRef} · ` : ''}
          {item.target}
        </Text>
        <Text style={styles.meta}>{updatedText}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {backgroundColor: '#FFFFFF',borderRadius: 16,padding: 16,marginBottom: 12,borderWidth: 1,borderColor: '#E2E8F0',elevation: 2,shadowColor: '#000',shadowOffset: { width: 0, height: 1 },shadowOpacity: 0.05,shadowRadius: 3,},
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  kindRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  kind: { fontSize: 12, fontWeight: '700', color: '#DC2626' },
  chip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  chipText: { fontSize: 11, fontWeight: '700' },
  topic: { fontSize: 14, fontWeight: '700', color: '#0F172A', marginTop: 10, lineHeight: 19 },
  flagRow: { flexDirection: 'row', gap: 6, marginTop: 8 },
  flag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  flagText: { fontSize: 10, fontWeight: '700' },
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, gap: 8 },
  meta: { fontSize: 11, color: '#64748B', flexShrink: 1 },
});
