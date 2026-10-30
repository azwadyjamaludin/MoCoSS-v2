// Field names match the backend (/api/full-mark/...).
export interface Criterion {
  id: number;
  name: string;
  description: string | null;
  max_marks: number;
  sort_order: number;
  is_active: boolean;
}

export interface Supervisee {
  id: number;
  full_name: string | null;
  email: string;
}

export interface EvaluationScore {
  criterion_id: number;
  criterion_name: string;
  max_marks: number;
  marks: number;
  remarks: string | null;
}

export interface Evaluation {
  id: number;
  supervisee_id: number;
  evaluator_id: number;
  supervisee_name: string | null;
  evaluator_name: string | null;
  total_marks: number;
  max_total: number;
  percent: number;
  comments: string | null;
  created_at: string | null;
  scores: EvaluationScore[];
}

export interface ScoreInput {
  criterion_id: number;
  marks: number;
  remarks?: string | null;
}

// Mutable on purpose: the admin mock edits this same list, so DEV_APP mode stays consistent.
export const mockCriteria: Criterion[] = [
  { id: 1, name: 'Counseling skills', description: 'Rapport, listening, probing and use of techniques', max_marks: 20, sort_order: 1, is_active: true },
  { id: 2, name: 'Case conceptualization', description: 'Quality of case analysis and formulation', max_marks: 20, sort_order: 2, is_active: true },
  { id: 3, name: 'Ethics and professionalism', description: 'Confidentiality, boundaries, cultural sensitivity', max_marks: 20, sort_order: 3, is_active: true },
  { id: 4, name: 'Documentation', description: 'Timely and complete log book and records', max_marks: 20, sort_order: 4, is_active: true },
  { id: 5, name: 'Reflection and growth', description: 'Use of supervision feedback and self reflection', max_marks: 20, sort_order: 5, is_active: true },
];

export const mockSupervisees: Supervisee[] = [
  { id: 11, full_name: 'Ahmad Faiz', email: 'faiz@mocoss.my' },
  { id: 12, full_name: 'Nur Aisyah', email: 'aisyah@mocoss.my' },
];

export const mockEvaluations: Evaluation[] = [
  {
    id: 1,
    supervisee_id: 11,
    evaluator_id: 1,
    supervisee_name: 'Ahmad Faiz',
    evaluator_name: 'Dr. Aisyah Rahman',
    total_marks: 78,
    max_total: 100,
    percent: 78,
    comments: 'Good progress. Work on naming protective factors in your formulations.',
    created_at: '2026-10-20T09:00:00',
    scores: [
      { criterion_id: 1, criterion_name: 'Counseling skills', max_marks: 20, marks: 16, remarks: 'Warm and attentive.' },
      { criterion_id: 2, criterion_name: 'Case conceptualization', max_marks: 20, marks: 14, remarks: null },
      { criterion_id: 3, criterion_name: 'Ethics and professionalism', max_marks: 20, marks: 17, remarks: null },
      { criterion_id: 4, criterion_name: 'Documentation', max_marks: 20, marks: 15, remarks: 'Submit logs sooner.' },
      { criterion_id: 5, criterion_name: 'Reflection and growth', max_marks: 20, marks: 16, remarks: null },
    ],
  },
];
