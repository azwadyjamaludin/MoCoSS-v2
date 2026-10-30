import { mockCriteria, type Criterion } from '@/data/mock/fullMark';

// Field names match the backend (/api/adm-mgt/...).
export interface AdminUser {
  id: number;
  email: string;
  username: string;
  full_name: string | null;
  role: string;
  is_active: boolean;
  is_mydid: boolean;
}

export interface Assignment {
  id: number;
  supervisor_id: number;
  supervisor_name: string | null;
  supervisee_id: number;
  supervisee_name: string | null;
}

export interface CounselorRow {
  id: number;
  full_name: string | null;
  log_hours: number;
  case_analyses: number;
  referrals: number;
  reflections: number;
  psychoeducation: number;
  professional_development: number;
  latest_mark_percent: number | null;
}

export interface Overview {
  users_total: number;
  users_active: number;
  users_by_role: Record<string, number>;
  log_hours_total: number;
  case_analyses_total: number;
  referrals_pending: number;
  evaluations_total: number;
  evaluation_average_percent: number | null;
  counselors: CounselorRow[];
}

export const ROLES = ['admin', 'supervisor', 'field supervisor', 'counselor'] as const;

export const mockUsers: AdminUser[] = [
  { id: 1, email: 'supervisor@mocoss.my', username: 'Test SV', full_name: 'Dr. Supervision Lead', role: 'supervisor', is_active: true, is_mydid: false },
  { id: 2, email: 'f_supervisor@mocoss.my', username: 'Test FSV', full_name: 'Dr. Field Supervisor', role: 'field supervisor', is_active: true, is_mydid: false },
  { id: 11, email: 'faiz@mocoss.my', username: 'faiz', full_name: 'Ahmad Faiz', role: 'counselor', is_active: true, is_mydid: false },
  { id: 12, email: 'aisyah@mocoss.my', username: 'aisyah', full_name: 'Nur Aisyah', role: 'counselor', is_active: true, is_mydid: false },
  { id: 20, email: 'admin@mocoss.my', username: 'admin', full_name: 'System Admin', role: 'admin', is_active: true, is_mydid: false },
];

export const mockAssignments: Assignment[] = [
  { id: 1, supervisor_id: 1, supervisor_name: 'Dr. Supervision Lead', supervisee_id: 11, supervisee_name: 'Ahmad Faiz' },
];

export const mockOverview: Overview = {
  users_total: 5,
  users_active: 5,
  users_by_role: { admin: 1, supervisor: 1, 'field supervisor': 1, counselor: 2 },
  log_hours_total: 42.5,
  case_analyses_total: 7,
  referrals_pending: 2,
  evaluations_total: 1,
  evaluation_average_percent: 78,
  counselors: [
    { id: 11, full_name: 'Ahmad Faiz', log_hours: 24, case_analyses: 4, referrals: 1, reflections: 3, psychoeducation: 2, professional_development: 2, latest_mark_percent: 78 },
    { id: 12, full_name: 'Nur Aisyah', log_hours: 18.5, case_analyses: 3, referrals: 1, reflections: 1, psychoeducation: 1, professional_development: 1, latest_mark_percent: null },
  ],
};

// Same list the Full Mark mock reads, so edits in Admin show up in the scoring form.
export const mockAdminCriteria: Criterion[] = mockCriteria;
