import { DEV_APP } from '@/data/dev-app';
import {
  mockCriteria,
  mockEvaluations,
  mockSupervisees,
  type Criterion,
  type Evaluation,
  type ScoreInput,
  type Supervisee,
} from '@/data/mock/fullMark';
import { apiFetch } from '@/services/api';

export const fetchRubric = async (): Promise<Criterion[]> =>
  DEV_APP ? mockCriteria.filter((c) => c.is_active) : apiFetch<Criterion[]>('/api/full-mark/criteria');

export const fetchSupervisees = async (): Promise<Supervisee[]> =>
  DEV_APP ? mockSupervisees : apiFetch<Supervisee[]>('/api/full-mark/supervisees');

export const fetchEvaluations = async (): Promise<Evaluation[]> =>
  DEV_APP ? [...mockEvaluations] : apiFetch<Evaluation[]>('/api/full-mark/evaluations');

export async function fetchEvaluation(id: number): Promise<Evaluation> {
  if (!DEV_APP) return apiFetch<Evaluation>(`/api/full-mark/evaluations/${id}`);
  const found = mockEvaluations.find((e) => e.id === id);
  if (!found) throw new Error('Evaluation not found.');
  return found;
}

export async function submitEvaluation(
  superviseeId: number,
  comments: string | null,
  scores: ScoreInput[],
): Promise<Evaluation> {
  if (!DEV_APP) {
    return apiFetch<Evaluation>('/api/full-mark/evaluations', {
      method: 'POST',
      body: { supervisee_id: superviseeId, comments, scores },
    });
  }
  const active = mockCriteria.filter((c) => c.is_active);
  const total = scores.reduce((sum, s) => sum + s.marks, 0);
  const max = active.reduce((sum, c) => sum + c.max_marks, 0);
  const supervisee = mockSupervisees.find((s) => s.id === superviseeId);
  const evaluation: Evaluation = {
    id: mockEvaluations.reduce((m, e) => Math.max(m, e.id), 0) + 1,
    supervisee_id: superviseeId,
    evaluator_id: 1,
    supervisee_name: supervisee?.full_name ?? null,
    evaluator_name: 'Test Supervisor',
    total_marks: total,
    max_total: max,
    percent: max ? Math.round((total / max) * 1000) / 10 : 0,
    comments,
    created_at: new Date().toISOString(),
    scores: scores.map((s) => {
      const c = active.find((x) => x.id === s.criterion_id)!;
      return { criterion_id: c.id, criterion_name: c.name, max_marks: c.max_marks, marks: s.marks, remarks: s.remarks ?? null };
    }),
  };
  mockEvaluations.unshift(evaluation);
  return evaluation;
}
