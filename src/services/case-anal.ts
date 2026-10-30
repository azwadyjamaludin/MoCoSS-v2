import type { CaseStatus } from '@/components/modules/CaseCard';
import type { CaseDetail } from '@/data/mock/caseAnal';
import { emptySections } from '@/data/mock/caseAnal';

// Shape returned by GET /api/case-anal/ (MoCoSS-backend, models/caseAnal.py)
export interface CaseAnalApiRecord {
  id: number;
  user_id: number;
  client_code: string;
  presenting_problem: string;
  session_dynamics: string | null;
  ai_supervision_feedback: string | null;
  created_at: string | null;
  updated_at: string | null;
}

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export function toCaseDetail(r: CaseAnalApiRecord): CaseDetail {
  const sections = emptySections();
  sections.concern = { text: r.presenting_problem ?? '', ai: 'none' };
  sections.formulation = { text: r.session_dynamics ?? '', ai: 'none' };

  const sectionsDone = Object.values(sections).filter((s) => s.text.trim().length > 0).length;
  const status: CaseStatus = 'submitted';

  return {
    id: String(r.id),
    caseRef: r.client_code,
    focus: r.presenting_problem,
    updated: r.updated_at ?? r.created_at ?? new Date().toISOString(),
    status,
    sessionsLinked: 0,
    sectionsDone,
    sectionsTotal: Object.keys(sections).length,
    aiAssisted: !!r.ai_supervision_feedback,
    linkedSessionIds: [],
    supervisorFeedback: r.ai_supervision_feedback ?? undefined,
    sections,
  };
}

export async function fetchCaseAnalyses(userId?: number): Promise<CaseDetail[]> {
  const query = userId !== undefined ? `?user_id=${userId}` : '';
  const response = await fetch(`${API_URL}/api/case-anal/${query}`);
  if (!response.ok) throw new Error(`Failed to load case analyses (${response.status})`);

  const json: { status: string; data: CaseAnalApiRecord[] } = await response.json();
  return json.data.map(toCaseDetail);
}
