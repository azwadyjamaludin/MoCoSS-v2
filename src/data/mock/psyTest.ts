import { createMemoryStore } from '@/data/mock/memoryStore';

// Field names match the backend (GET /api/psy-test/).
export interface PsychologyTest {
  id: number;
  test_name: string;
  case_ref: string | null; // de-identified code only, never a client name
  test_date: string; // YYYY-MM-DD
  raw_score: number | null;
  interpretation: string | null;
  notes: string | null;
}

export const psyTestStore = createMemoryStore<PsychologyTest>([
  {
    id: 2,
    test_name: 'DASS-21',
    case_ref: 'C-014',
    test_date: '2026-10-21',
    raw_score: 18,
    interpretation: 'Moderate anxiety',
    notes: 'Retest after the sixth session.',
  },
  {
    id: 1,
    test_name: 'Beck Depression Inventory',
    case_ref: 'C-015',
    test_date: '2026-10-14',
    raw_score: 12,
    interpretation: 'Mild mood disturbance',
    notes: null,
  },
]);
