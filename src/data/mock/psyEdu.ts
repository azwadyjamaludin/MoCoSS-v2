import { createMemoryStore } from '@/data/mock/memoryStore';

// Field names match the backend (GET /api/psy-edu/).
export interface PsychoEducation {
  id: number;
  title: string;
  topic: string | null;
  target_group: string | null;
  delivery_method: string;
  activity_date: string; // YYYY-MM-DD
  participant_count: number;
  materials_notes: string | null;
  outcome_notes: string | null;
}

export const psyEduStore = createMemoryStore<PsychoEducation>([
  {
    id: 2,
    title: 'Managing exam stress',
    topic: 'Stress management',
    target_group: 'Form 5 students',
    delivery_method: 'Workshop',
    activity_date: '2026-10-24',
    participant_count: 32,
    materials_notes: 'Slides, breathing exercise handout.',
    outcome_notes: 'Students reported the breathing exercise as most useful. Two asked for individual sessions.',
  },
  {
    id: 1,
    title: 'Healthy sleep habits',
    topic: 'Sleep hygiene',
    target_group: 'Parents',
    delivery_method: 'Talk',
    activity_date: '2026-10-15',
    participant_count: 18,
    materials_notes: 'One-page sleep routine guide.',
    outcome_notes: null,
  },
]);
