import Header from '@/components/Header';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { translations } from '@/context/localization';
import { DEV_APP } from '@/data/dev-app';
import { ROLES, type AdminUser, type Assignment, type Overview } from '@/data/mock/admin';
import type { Criterion } from '@/data/mock/fullMark';
import { useLoad } from '@/hooks/use-load';
import { createAssignment, createCriterion, deleteAssignment, fetchAllCriteria, fetchAssignments, fetchOverview, fetchUsers, updateCriterion, updateUser, } from '@/services/adm-mgt';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View, } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ACCENT = '#475569';
type Tab = 'overview' | 'users' | 'assignments' | 'rubric';

const errText = (e: unknown) => (e instanceof Error ? e.message : undefined);

export default function AdminManagementScreen() {
  const { lang } = useLanguage();
  const { user } = useAuth();
  const bm = lang === 'BM';
  const [tab, setTab] = useState<Tab>('overview');

  if (!DEV_APP && user?.role !== 'admin') {
    return (
      <SafeAreaView style={styles.container}>
        <Header subtitle={translations[lang].admMgtTitle} />
        <Text style={styles.empty}>{bm ? 'Hanya untuk admin.' : 'Admins only.'}</Text>
      </SafeAreaView>
    );
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'overview', label: bm ? 'Ringkasan' : 'Overview' },
    { key: 'users', label: bm ? 'Pengguna' : 'Users' },
    { key: 'assignments', label: bm ? 'Penugasan' : 'Assignments' },
    { key: 'rubric', label: bm ? 'Rubrik' : 'Rubric' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Header subtitle={translations[lang].admMgtTitle} />
      <View style={styles.tabRow}>
        {tabs.map((t) => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tab, tab === t.key && styles.tabOn]}
            onPress={() => setTab(t.key)}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, tab === t.key && styles.tabTextOn]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {tab === 'overview' && <OverviewTab bm={bm} />}
        {tab === 'users' && <UsersTab bm={bm} />}
        {tab === 'assignments' && <AssignmentsTab bm={bm} />}
        {tab === 'rubric' && <RubricTab bm={bm} />}
      </ScrollView>
    </SafeAreaView>
  );
}

function OverviewTab({ bm }: { bm: boolean }) {
  const { data, loading, error } = useLoad<Overview | null>(fetchOverview, null);
  if (loading) return <ActivityIndicator color="#CBD5E1" />;
  if (!data) return <Text style={styles.empty}>{error ?? (bm ? 'Tiada data.' : 'No data.')}</Text>;

  const stat = (value: string | number, label: string) => (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  return (
    <>
      <View style={styles.statGrid}>
        {stat(`${data.users_active}/${data.users_total}`, bm ? 'Pengguna aktif' : 'Active users')}
        {stat(data.log_hours_total, bm ? 'Jam log' : 'Log hours')}
        {stat(data.case_analyses_total, bm ? 'Analisis kes' : 'Case analyses')}
        {stat(data.referrals_pending, bm ? 'Rujukan menunggu' : 'Pending referrals')}
        {stat(data.evaluations_total, bm ? 'Penilaian' : 'Evaluations')}
        {stat(data.evaluation_average_percent === null ? '-' : `${data.evaluation_average_percent}%`, bm ? 'Purata markah' : 'Average mark')}
      </View>

      <Text style={styles.sectionTitle}>{bm ? 'Kemajuan kaunselor' : 'Counselor progress'}</Text>
      {data.counselors.length === 0 && <Text style={styles.muted}>{bm ? 'Tiada kaunselor.' : 'No counselors yet.'}</Text>}
      {data.counselors.map((c) => (
        <View key={c.id} style={styles.card}>
          <Text style={styles.cardTitle}>{c.full_name ?? `#${c.id}`}</Text>
          <Text style={styles.cardMeta}>
            {bm ? 'Jam' : 'Hours'} {c.log_hours} · {bm ? 'Kes' : 'Cases'} {c.case_analyses} · {bm ? 'Rujukan' : 'Referrals'} {c.referrals}
          </Text>
          <Text style={styles.cardMeta}>
            {bm ? 'Refleksi' : 'Reflections'} {c.reflections} · {bm ? 'Psikoedukasi' : 'Psychoed.'} {c.psychoeducation} · PD {c.professional_development}
          </Text>
          <Text style={styles.cardMeta}>
            {bm ? 'Markah terkini' : 'Latest mark'}: {c.latest_mark_percent === null ? '-' : `${c.latest_mark_percent}%`}
          </Text>
        </View>
      ))}
    </>
  );
}

function UsersTab({ bm }: { bm: boolean }) {
  const [q, setQ] = useState('');
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<number | null>(null);

  const load = async (query: string) => {
    setLoading(true);
    try {
      setUsers(await fetchUsers(query));
    } catch (e) {
      Alert.alert(bm ? 'Gagal memuatkan' : 'Could not load', errText(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load('');
  }, []);

  const patch = async (id: number, change: { role?: string; is_active?: boolean }) => {
    try {
      const updated = await updateUser(id, change);
      setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
    } catch (e) {
      Alert.alert(bm ? 'Gagal mengemas kini' : 'Update failed', errText(e));
    }
  };

  return (
    <>
      <TextInput
        style={styles.input}
        value={q}
        onChangeText={setQ}
        onSubmitEditing={() => load(q)}
        returnKeyType="search"
        placeholder={bm ? 'Cari nama atau emel' : 'Search name or email'}
        placeholderTextColor="#94A3B8"
      />
      {loading && <ActivityIndicator style={{ marginTop: 16 }} color="#CBD5E1" />}
      {users.map((u) => (
        <TouchableOpacity
          key={u.id}
          style={[styles.card, !u.is_active && { opacity: 0.55 }]}
          activeOpacity={0.8}
          onPress={() => setOpenId(openId === u.id ? null : u.id)}
        >
          <Text style={styles.cardTitle}>{u.full_name ?? u.username}</Text>
          <Text style={styles.cardMeta}>
            {u.email} · {u.role}
            {u.is_active ? '' : bm ? ' · tidak aktif' : ' · inactive'}
          </Text>
          {openId === u.id && (
            <View style={{ marginTop: 10 }}>
              <View style={styles.chipRow}>
                {ROLES.map((r) => (
                  <TouchableOpacity
                    key={r}
                    style={[styles.chip, u.role === r && styles.chipOn]}
                    onPress={() => u.role !== r && patch(u.id, { role: r })}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.chipText, u.role === r && styles.chipTextOn]}>{r}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.switchRow}>
                <Text style={styles.cardMeta}>{bm ? 'Aktif' : 'Active'}</Text>
                <Switch value={u.is_active} onValueChange={(v) => patch(u.id, { is_active: v })} />
              </View>
            </View>
          )}
        </TouchableOpacity>
      ))}
    </>
  );
}

function AssignmentsTab({ bm }: { bm: boolean }) {
  const assignments = useLoad<Assignment[]>(fetchAssignments, []);
  const people = useLoad<AdminUser[]>(() => fetchUsers(), []);
  const [supervisorId, setSupervisorId] = useState<number | null>(null);
  const [superviseeId, setSuperviseeId] = useState<number | null>(null);

  const supervisors = people.data.filter((u) => u.is_active && (u.role === 'supervisor' || u.role === 'field supervisor'));
  const counselors = people.data.filter((u) => u.is_active && u.role === 'counselor');

  const add = async () => {
    if (supervisorId === null || superviseeId === null) {
      Alert.alert(bm ? 'Pilih kedua-duanya' : 'Pick both a supervisor and a counselor');
      return;
    }
    try {
      await createAssignment(supervisorId, superviseeId);
      setSuperviseeId(null);
      assignments.reload();
    } catch (e) {
      Alert.alert(bm ? 'Gagal menugaskan' : 'Could not assign', errText(e));
    }
  };

  const remove = (a: Assignment) =>
    Alert.alert(bm ? 'Buang penugasan?' : 'Remove assignment?', `${a.supervisor_name} → ${a.supervisee_name}`, [
      { text: bm ? 'Batal' : 'Cancel', style: 'cancel' },
      {
        text: bm ? 'Buang' : 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteAssignment(a.id);
            assignments.reload();
          } catch (e) {
            Alert.alert(bm ? 'Gagal membuang' : 'Could not remove', errText(e));
          }
        },
      },
    ]);

  const pick = (list: AdminUser[], selected: number | null, set: (id: number) => void) => (
    <View style={styles.chipRow}>
      {list.length === 0 && <Text style={styles.muted}>{bm ? 'Tiada pengguna.' : 'No users.'}</Text>}
      {list.map((u) => (
        <TouchableOpacity
          key={u.id}
          style={[styles.chip, selected === u.id && styles.chipOn]}
          onPress={() => set(u.id)}
          activeOpacity={0.7}
        >
          <Text style={[styles.chipText, selected === u.id && styles.chipTextOn]}>{u.full_name ?? u.email}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{bm ? 'Tugaskan kaunselor' : 'Assign a counselor'}</Text>
        <Text style={styles.label}>{bm ? 'Penyelia' : 'Supervisor'}</Text>
        {pick(supervisors, supervisorId, setSupervisorId)}
        <Text style={styles.label}>{bm ? 'Kaunselor' : 'Counselor'}</Text>
        {pick(counselors, superviseeId, setSuperviseeId)}
        <TouchableOpacity style={styles.primary} onPress={add} activeOpacity={0.8}>
          <Text style={styles.primaryText}>{bm ? 'Tugaskan' : 'Assign'}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>{bm ? 'Penugasan semasa' : 'Current assignments'}</Text>
      {assignments.loading && <ActivityIndicator color="#CBD5E1" />}
      {!assignments.loading && assignments.data.length === 0 && (
        <Text style={styles.muted}>{bm ? 'Tiada penugasan.' : 'No assignments yet.'}</Text>
      )}
      {assignments.data.map((a) => (
        <View key={a.id} style={[styles.card, styles.row]}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>{a.supervisee_name}</Text>
            <Text style={styles.cardMeta}>
              {bm ? 'Penyelia' : 'Supervisor'}: {a.supervisor_name}
            </Text>
          </View>
          <TouchableOpacity onPress={() => remove(a)} activeOpacity={0.7}>
            <Text style={styles.removeText}>{bm ? 'Buang' : 'Remove'}</Text>
          </TouchableOpacity>
        </View>
      ))}
    </>
  );
}

type Draft = { id?: number; name: string; description: string; max_marks: string; sort_order: string };

function RubricTab({ bm }: { bm: boolean }) {
  const { data, loading, reload } = useLoad<Criterion[]>(fetchAllCriteria, []);
  const [draft, setDraft] = useState<Draft | null>(null);

  const toDraft = (c?: Criterion): Draft => ({
    id: c?.id,
    name: c?.name ?? '',
    description: c?.description ?? '',
    max_marks: String(c?.max_marks ?? 10),
    sort_order: String(c?.sort_order ?? data.length + 1),
  });

  const save = async () => {
    if (!draft) return;
    const max = Number(draft.max_marks);
    const order = Number(draft.sort_order);
    if (!draft.name.trim() || !Number.isInteger(max) || max <= 0 || !Number.isInteger(order)) {
      Alert.alert(bm ? 'Maklumat tidak sah' : 'Invalid input', bm ? 'Nama dan markah maksimum (nombor bulat) diperlukan.' : 'A name and a whole-number maximum are required.');
      return;
    }
    const existing = data.find((c) => c.id === draft.id);
    const body = {
      name: draft.name.trim(),
      description: draft.description.trim() || null,
      max_marks: max,
      sort_order: order,
      is_active: existing?.is_active ?? true,
    };
    try {
      if (draft.id === undefined) await createCriterion(body);
      else await updateCriterion(draft.id, body);
      setDraft(null);
      reload();
    } catch (e) {
      Alert.alert(bm ? 'Gagal menyimpan' : 'Save failed', errText(e));
    }
  };

  const toggleActive = async (c: Criterion, value: boolean) => {
    try {
      await updateCriterion(c.id, {
        name: c.name, description: c.description, max_marks: c.max_marks, sort_order: c.sort_order, is_active: value,
      });
      reload();
    } catch (e) {
      Alert.alert(bm ? 'Gagal mengemas kini' : 'Update failed', errText(e));
    }
  };

  const total = data.filter((c) => c.is_active).reduce((s, c) => s + c.max_marks, 0);

  return (
    <>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{bm ? 'Jumlah markah aktif' : 'Active total'}: {total}</Text>
        <Text style={styles.cardMeta}>
          {bm
            ? 'Penilaian lama kekal menggunakan kriteria asal. Kriteria yang dimatikan tidak lagi muncul dalam penilaian baharu.'
            : 'Old evaluations keep the criteria they were scored on. Turned-off criteria no longer appear in new evaluations.'}
        </Text>
      </View>

      {draft ? (
        <View style={styles.card}>
          <Text style={styles.label}>{bm ? 'Nama' : 'Name'}</Text>
          <TextInput style={styles.input} value={draft.name} onChangeText={(t) => setDraft({ ...draft, name: t })} />
          <Text style={styles.label}>{bm ? 'Keterangan' : 'Description'}</Text>
          <TextInput style={styles.input} value={draft.description} onChangeText={(t) => setDraft({ ...draft, description: t })} />
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>{bm ? 'Markah maksimum' : 'Max marks'}</Text>
              <TextInput style={styles.input} value={draft.max_marks} keyboardType="number-pad" onChangeText={(t) => setDraft({ ...draft, max_marks: t })} />
            </View>
            <View style={{ width: 12 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>{bm ? 'Susunan' : 'Order'}</Text>
              <TextInput style={styles.input} value={draft.sort_order} keyboardType="number-pad" onChangeText={(t) => setDraft({ ...draft, sort_order: t })} />
            </View>
          </View>
          <TouchableOpacity style={styles.primary} onPress={save} activeOpacity={0.8}>
            <Text style={styles.primaryText}>{bm ? 'Simpan' : 'Save'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondary} onPress={() => setDraft(null)} activeOpacity={0.8}>
            <Text style={styles.secondaryText}>{bm ? 'Batal' : 'Cancel'}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={styles.primary} onPress={() => setDraft(toDraft())} activeOpacity={0.8}>
          <Text style={styles.primaryText}>{bm ? 'Tambah kriteria' : 'Add criterion'}</Text>
        </TouchableOpacity>
      )}

      {loading && <ActivityIndicator style={{ marginTop: 16 }} color="#CBD5E1" />}
      {data.map((c) => (
        <View key={c.id} style={[styles.card, styles.row, !c.is_active && { opacity: 0.55 }]}>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => setDraft(toDraft(c))} activeOpacity={0.7}>
            <Text style={styles.cardTitle}>
              {c.sort_order}. {c.name} ({c.max_marks})
            </Text>
            {!!c.description && <Text style={styles.cardMeta}>{c.description}</Text>}
          </TouchableOpacity>
          <Switch value={c.is_active} onValueChange={(v) => toggleActive(c, v)} />
        </View>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0F19' },
  content: { padding: 16, paddingBottom: 48 },
  empty: { textAlign: 'center', color: '#94A3B8', marginTop: 32, paddingHorizontal: 24 },
  muted: { fontSize: 12, color: '#94A3B8', marginBottom: 8 },
  tabRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingTop: 8 },
  tab: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, backgroundColor: '#1E293B' },
  tabOn: { backgroundColor: '#E2E8F0' },
  tabText: { fontSize: 12, fontWeight: '600', color: '#94A3B8' },
  tabTextOn: { color: '#0F172A' },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#CBD5E1', marginTop: 16, marginBottom: 10 },
  statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  stat: { width: '31%', flexGrow: 1, backgroundColor: '#FFFFFF', borderRadius: 14, padding: 12, alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: '700', color: '#0F172A' },
  statLabel: { fontSize: 10, color: '#64748B', marginTop: 2, textAlign: 'center' },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 14, marginTop: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  row: { flexDirection: 'row', alignItems: 'center' },
  cardTitle: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  cardMeta: { fontSize: 11, color: '#64748B', marginTop: 3, lineHeight: 16 },
  input: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: '#0F172A' },
  label: { fontSize: 12, fontWeight: '700', color: '#475569', marginTop: 10, marginBottom: 6 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#E2E8F0' },
  chipOn: { backgroundColor: ACCENT, borderColor: ACCENT },
  chipText: { fontSize: 12, fontWeight: '600', color: '#475569' },
  chipTextOn: { color: '#FFFFFF' },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },
  primary: { backgroundColor: ACCENT, borderRadius: 14, paddingVertical: 12, alignItems: 'center', marginTop: 14 },
  primaryText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  secondary: { borderRadius: 14, paddingVertical: 12, alignItems: 'center', marginTop: 8, borderWidth: 1, borderColor: ACCENT },
  secondaryText: { color: ACCENT, fontSize: 14, fontWeight: '700' },
  removeText: { color: '#DC2626', fontSize: 12, fontWeight: '700' },
});
