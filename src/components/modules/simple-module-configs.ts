import type { SimpleModuleConfig } from '@/components/modules/SimpleModule';
import { translations } from '@/context/localization';
import type { ProfDev } from '@/data/mock/profDev';
import type { PsychoEducation } from '@/data/mock/psyEdu';
import type { PsychologyTest } from '@/data/mock/psyTest';
import type { SelfReflection } from '@/data/mock/reflect';
import { profDevService, psyEduService, psyTestService, reflectService } from '@/services/simple-modules';

const today = () => new Date().toISOString().slice(0, 10);

export const reflectConfig: SimpleModuleConfig<SelfReflection> = {
  routeBase: '/reflect',
  headerTitle: (lang) => translations[lang].reflectTitle,
  accent: '#E11D48',
  service: reflectService,
  fields: [
    { key: 'title', bm: 'Tajuk', en: 'Title', type: 'text', required: true },
    { key: 'reflection_date', bm: 'Tarikh', en: 'Date', type: 'date', required: true },
    { key: 'content', bm: 'Apa yang berlaku dan apa yang saya rasa', en: 'What happened and how I felt', type: 'multiline', required: true },
    { key: 'strengths', bm: 'Kekuatan', en: 'Strengths', type: 'multiline' },
    { key: 'growth_areas', bm: 'Bahagian untuk dibaiki', en: 'Areas to grow', type: 'multiline' },
    { key: 'action_plan', bm: 'Pelan tindakan', en: 'Action plan', type: 'multiline' },
  ],
  defaults: { title: '', reflection_date: today(), content: '', strengths: '', growth_areas: '', action_plan: '' },
  cardTitle: (r) => r.title,
  cardMeta: (r) => r.reflection_date,
  cardBody: (r) => r.content,
  emptyBm: 'Tiada refleksi lagi.',
  emptyEn: 'No reflections yet.',
};

export const psyEduConfig: SimpleModuleConfig<PsychoEducation> = {
  routeBase: '/psy-edu',
  headerTitle: (lang) => translations[lang].psyEduTitle,
  accent: '#059669',
  service: psyEduService,
  fields: [
    { key: 'title', bm: 'Tajuk aktiviti', en: 'Activity title', type: 'text', required: true },
    { key: 'topic', bm: 'Topik', en: 'Topic', type: 'text' },
    { key: 'target_group', bm: 'Kumpulan sasaran', en: 'Target group', type: 'text' },
    { key: 'delivery_method', bm: 'Kaedah', en: 'Delivery method', type: 'choice', options: ['Workshop', 'Talk', 'Module', 'Handout', 'Online'], required: true },
    { key: 'activity_date', bm: 'Tarikh', en: 'Date', type: 'date', required: true },
    { key: 'participant_count', bm: 'Bilangan peserta', en: 'Participants', type: 'number' },
    { key: 'materials_notes', bm: 'Bahan / modul digunakan', en: 'Materials / module used', type: 'multiline' },
    { key: 'outcome_notes', bm: 'Hasil dan maklum balas', en: 'Outcome and feedback', type: 'multiline' },
  ],
  defaults: { title: '', topic: '', target_group: '', delivery_method: 'Workshop', activity_date: today(), participant_count: '0', materials_notes: '', outcome_notes: '' },
  cardTitle: (r) => r.title,
  cardMeta: (r) => `${r.activity_date} · ${r.delivery_method} · ${r.participant_count}`,
  cardBody: (r) => r.outcome_notes ?? r.topic,
  emptyBm: 'Tiada aktiviti psikoedukasi lagi.',
  emptyEn: 'No psychoeducation activities yet.',
};

export const profDevConfig: SimpleModuleConfig<ProfDev> = {
  routeBase: '/prof-dev',
  headerTitle: (lang) => translations[lang].profDevTitle,
  accent: '#0891B2',
  service: profDevService,
  fields: [
    { key: 'activity_title', bm: 'Tajuk aktiviti', en: 'Activity title', type: 'text', required: true },
    { key: 'activity_type', bm: 'Jenis', en: 'Type', type: 'choice', options: ['Workshop', 'Seminar', 'Course', 'Conference', 'Webinar', 'Other'], required: true },
    { key: 'provider', bm: 'Penyedia', en: 'Provider', type: 'text' },
    { key: 'activity_date', bm: 'Tarikh', en: 'Date', type: 'date', required: true },
    { key: 'hours', bm: 'Jam', en: 'Hours', type: 'number' },
    { key: 'certificate_ref', bm: 'Rujukan sijil', en: 'Certificate reference', type: 'text' },
    { key: 'learning_outcome', bm: 'Hasil pembelajaran', en: 'Learning outcome', type: 'multiline' },
  ],
  defaults: { activity_title: '', activity_type: 'Workshop', provider: '', activity_date: today(), hours: '0', certificate_ref: '', learning_outcome: '' },
  cardTitle: (r) => r.activity_title,
  cardMeta: (r) => `${r.activity_date} · ${r.activity_type} · ${r.hours}h`,
  cardBody: (r) => r.learning_outcome ?? r.provider,
  emptyBm: 'Tiada aktiviti pembangunan profesional lagi.',
  emptyEn: 'No professional development activities yet.',
};

export const psyTestConfig: SimpleModuleConfig<PsychologyTest> = {
  routeBase: '/psy-test',
  headerTitle: (lang) => translations[lang].psyTestTitle,
  accent: '#4F46E5',
  service: psyTestService,
  fields: [
    { key: 'test_name', bm: 'Nama ujian / inventori', en: 'Test / inventory name', type: 'text', required: true },
    { key: 'case_ref', bm: 'Kod kes (tanpa nama klien)', en: 'Case code (no client name)', type: 'text' },
    { key: 'test_date', bm: 'Tarikh', en: 'Date', type: 'date', required: true },
    { key: 'raw_score', bm: 'Skor mentah', en: 'Raw score', type: 'number', nullable: true },
    { key: 'interpretation', bm: 'Tafsiran', en: 'Interpretation', type: 'text' },
    { key: 'notes', bm: 'Catatan', en: 'Notes', type: 'multiline' },
  ],
  defaults: { test_name: '', case_ref: '', test_date: today(), raw_score: '', interpretation: '', notes: '' },
  cardTitle: (r) => r.test_name,
  cardMeta: (r) => `${r.test_date}${r.case_ref ? ` · ${r.case_ref}` : ''}${r.raw_score !== null ? ` · ${r.raw_score}` : ''}`,
  cardBody: (r) => r.interpretation ?? r.notes,
  emptyBm: 'Tiada rekod ujian lagi.',
  emptyEn: 'No tests recorded yet.',
};
