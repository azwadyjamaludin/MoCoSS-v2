import { createMemoryStore } from '@/data/mock/memoryStore';

// Field names match the backend (GET /api/reflect/).
export interface SelfReflection {
  id: number;
  title: string;
  reflection_date: string; // YYYY-MM-DD
  content: string;
  strengths: string | null;
  growth_areas: string | null;
  action_plan: string | null;
}

export const reflectStore = createMemoryStore<SelfReflection>([
  {
    id: 2,
    title: 'Staying with silence',
    reflection_date: '2026-10-27',
    content: 'In today\'s session I filled a long silence too quickly. Afterwards I noticed my own discomfort with not knowing what to say.',
    strengths: 'Warm tone, good eye contact, clear summary at the end.',
    growth_areas: 'Tolerating silence, slowing down before asking the next question.',
    action_plan: 'Count to five before responding. Bring one recording clip to supervision.',
  },
  {
    id: 1,
    title: 'First group session',
    reflection_date: '2026-10-22',
    content: 'I felt nervous co-facilitating. The opening round helped the group settle, and I relaxed after the first ten minutes.',
    strengths: 'Prepared materials, kept to time.',
    growth_areas: 'Balancing participation when one member dominates.',
    action_plan: null,
  },
]);
