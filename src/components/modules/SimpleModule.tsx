import Header from '@/components/Header';
import { useLanguage } from '@/context/LanguageContext';
import { useLoad } from '@/hooks/use-load';
import type { CrudService } from '@/services/crud';
import { Ionicons } from '@expo/vector-icons';
import { Href, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export type FieldType = 'text' | 'multiline' | 'date' | 'number' | 'choice';

export interface FieldDef {
  key: string;
  bm: string;
  en: string;
  type: FieldType;
  required?: boolean;
  nullable?: boolean; // 'number' only: a blank value is sent as null instead of 0
  options?: string[]; // for 'choice'
}

export interface SimpleModuleConfig<T extends { id: number }> {
  routeBase: string; // e.g. '/reflect'
  headerTitle: (lang: 'BM' | 'EN') => string;
  accent: string;
  fields: FieldDef[];
  defaults: Record<string, string>;
  service: CrudService<T>;
  cardTitle: (r: T) => string;
  cardMeta: (r: T, lang: 'BM' | 'EN') => string;
  cardBody: (r: T) => string | null | undefined;
  emptyBm: string;
  emptyEn: string;
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// ----------------------------------------------------------------------------- list
export function SimpleListScreen<T extends { id: number }>({ config }: { config: SimpleModuleConfig<T> }) {
  const { lang } = useLanguage();
  const router = useRouter();
  const L = lang as 'BM' | 'EN';
  const { data, loading, error } = useLoad<T[]>(() => config.service.list(), []);

  return (
    <SafeAreaView style={styles.container}>
      <Header subtitle={config.headerTitle(L)} />
      <FlatList
        data={data}
        keyExtractor={(r) => String(r.id)}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator style={styles.empty} color={config.accent} />
          ) : (
            <Text style={styles.empty}>
              {error ? (L === 'BM' ? 'Tidak dapat memuatkan rekod.' : 'Could not load records.') : L === 'BM' ? config.emptyBm : config.emptyEn}
            </Text>
          )
        }
        renderItem={({ item }) => {
          const body = config.cardBody(item);
          return (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.8}
              onPress={() => router.push(`${config.routeBase}/${item.id}` as Href)}
            >
              <Text style={styles.cardTitle}>{config.cardTitle(item)}</Text>
              <Text style={styles.cardMeta}>{config.cardMeta(item, L)}</Text>
              {!!body && (
                <Text style={styles.cardBody} numberOfLines={2}>
                  {body}
                </Text>
              )}
            </TouchableOpacity>
          );
        }}
      />
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: config.accent }]}
        activeOpacity={0.8}
        onPress={() => router.push(`${config.routeBase}/new` as Href)}
      >
        <Ionicons name="add" size={26} color="#FFFFFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

// ----------------------------------------------------------------------------- form
export function SimpleFormScreen<T extends { id: number }>({ config }: { config: SimpleModuleConfig<T> }) {
  const { id } = useLocalSearchParams<{ id: string }>();
  const isNew = id === 'new';
  const { lang } = useLanguage();
  const router = useRouter();
  const bm = lang === 'BM';
  const L = lang as 'BM' | 'EN';

  const [values, setValues] = useState<Record<string, string>>(config.defaults);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isNew) return;
    config.service
      .get(Number(id))
      .then((record) => {
        const next: Record<string, string> = {};
        for (const f of config.fields) {
          const v = (record as unknown as Record<string, unknown>)[f.key];
          next[f.key] = v === null || v === undefined ? '' : String(v);
        }
        setValues(next);
      })
      .catch(() => {
        Alert.alert(bm ? 'Rekod tidak ditemui' : 'Record not found');
        router.back();
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const setValue = (key: string, value: string) => setValues((prev) => ({ ...prev, [key]: value }));

  const buildPayload = (): Partial<T> | null => {
    const payload: Record<string, unknown> = {};
    for (const f of config.fields) {
      const raw = (values[f.key] ?? '').trim();
      const label = bm ? f.bm : f.en;
      if (f.required && !raw) {
        Alert.alert(bm ? 'Maklumat tidak lengkap' : 'Missing information', `${label} ${bm ? 'diperlukan.' : 'is required.'}`);
        return null;
      }
      if (f.type === 'date' && raw && !DATE_RE.test(raw)) {
        Alert.alert(bm ? 'Tarikh tidak sah' : 'Invalid date', `${label}: YYYY-MM-DD`);
        return null;
      }
      if (f.type === 'number' && f.nullable && raw === '') {
        payload[f.key] = null;
      } else if (f.type === 'number') {
        const n = raw === '' ? 0 : Number(raw);
        if (Number.isNaN(n) || n < 0) {
          Alert.alert(bm ? 'Nombor tidak sah' : 'Invalid number', label);
          return null;
        }
        payload[f.key] = n;
      } else {
        payload[f.key] = raw === '' && !f.required ? null : raw;
      }
    }
    return payload as Partial<T>;
  };

  const save = async () => {
    const payload = buildPayload();
    if (!payload) return;
    setSaving(true);
    try {
      if (isNew) await config.service.create(payload);
      else await config.service.update(Number(id), payload);
      router.back();
    } catch (e) {
      Alert.alert(bm ? 'Gagal menyimpan' : 'Save failed', e instanceof Error ? e.message : undefined);
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = () =>
    Alert.alert(bm ? 'Padam rekod?' : 'Delete record?', undefined, [
      { text: bm ? 'Batal' : 'Cancel', style: 'cancel' },
      {
        text: bm ? 'Padam' : 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await config.service.remove(Number(id));
            router.back();
          } catch (e) {
            Alert.alert(bm ? 'Gagal memadam' : 'Delete failed', e instanceof Error ? e.message : undefined);
          }
        },
      },
    ]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header subtitle={config.headerTitle(L)} />
        <ActivityIndicator style={styles.empty} color={config.accent} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header subtitle={config.headerTitle(L)} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
          {config.fields.map((f) => (
            <View key={f.key}>
              <Text style={styles.label}>
                {bm ? f.bm : f.en}
                {f.required ? ' *' : ''}
              </Text>
              {f.type === 'choice' ? (
                <View style={styles.chipRow}>
                  {f.options?.map((o) => {
                    const on = values[f.key] === o;
                    return (
                      <TouchableOpacity
                        key={o}
                        style={[styles.chip, on && { backgroundColor: config.accent, borderColor: config.accent }]}
                        onPress={() => setValue(f.key, o)}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.chipText, on && { color: '#FFFFFF' }]}>{o}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ) : (
                <TextInput
                  style={[styles.input, f.type === 'multiline' && styles.multiline]}
                  value={values[f.key] ?? ''}
                  onChangeText={(t) => setValue(f.key, t)}
                  multiline={f.type === 'multiline'}
                  textAlignVertical={f.type === 'multiline' ? 'top' : 'center'}
                  keyboardType={f.type === 'number' ? 'decimal-pad' : 'default'}
                  placeholder={f.type === 'date' ? 'YYYY-MM-DD' : undefined}
                  placeholderTextColor="#94A3B8"
                />
              )}
            </View>
          ))}

          <TouchableOpacity
            style={[styles.primary, { backgroundColor: config.accent }, saving && { opacity: 0.5 }]}
            disabled={saving}
            onPress={save}
            activeOpacity={0.8}
          >
            {saving ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryText}>{bm ? 'Simpan' : 'Save'}</Text>}
          </TouchableOpacity>

          {!isNew && (
            <TouchableOpacity style={styles.danger} onPress={confirmDelete} activeOpacity={0.8}>
              <Text style={styles.dangerText}>{bm ? 'Padam' : 'Delete'}</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0F19' },
  list: { padding: 16, paddingBottom: 96 },
  empty: { textAlign: 'center', color: '#94A3B8', marginTop: 32 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#0F172A' },
  cardMeta: { fontSize: 11, color: '#64748B', marginTop: 2 },
  cardBody: { fontSize: 12, color: '#475569', marginTop: 8, lineHeight: 17 },
  fab: { position: 'absolute', right: 20, bottom: 28, width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', elevation: 4 },
  form: { padding: 16, paddingBottom: 48 },
  label: { fontSize: 12, fontWeight: '700', color: '#CBD5E1', marginBottom: 6, marginTop: 12 },
  input: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: '#0F172A' },
  multiline: { minHeight: 110 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0' },
  chipText: { fontSize: 12, fontWeight: '600', color: '#475569' },
  primary: { borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: 24 },
  primaryText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  danger: { borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: 10, borderWidth: 1, borderColor: '#DC2626' },
  dangerText: { color: '#DC2626', fontSize: 15, fontWeight: '700' },
});
