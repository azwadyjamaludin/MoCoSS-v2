import { createMemoryStore } from '@/data/mock/memoryStore';

// Field names match the backend (GET /api/prof-dev/).
export interface ProfDev {
  id: number;
  activity_title: string;
  activity_type: string;
  provider: string | null;
  activity_date: string; // YYYY-MM-DD
  hours: number;
  certificate_ref: string | null;
  learning_outcome: string | null;
}

export const profDevStore = createMemoryStore<ProfDev>([
  {
    id: 2,
    activity_title: 'Ethics in counseling practice',
    activity_type: 'Seminar',
    provider: 'Malaysian Counseling Association',
    activity_date: '2026-10-18',
    hours: 6,
    certificate_ref: 'PERKAMA-2026-0412',
    learning_outcome: 'Clearer on limits of confidentiality and when to consult a supervisor.',
  },
  {
    id: 1,
    activity_title: 'Introduction to CBT for anxiety',
    activity_type: 'Webinar',
    provider: 'UPSI Counseling Centre',
    activity_date: '2026-09-30',
    hours: 3,
    certificate_ref: null,
    learning_outcome: null,
  },
]);
