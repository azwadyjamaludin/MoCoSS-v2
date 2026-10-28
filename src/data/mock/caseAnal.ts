import type { CaseAnalysis } from '@/components/modules/CaseCard';

// Temporary mock data. Replace with the backend (GET /api/caseAnal/cases and /cases/:id).

export type SectionKey = 'concern' | 'background' | 'assessment' | 'formulation' | 'plan' | 'ethics';
export type AiState = 'none' | 'pending' | 'reviewed'; // pending = AI wrote it, a human has not confirmed it yet

export interface SectionValue {
  text: string;
  ai: AiState;
}

export interface CaseDetail extends CaseAnalysis {
  sections: Record<SectionKey, SectionValue>;
  linkedSessionIds: string[];
  supervisorFeedback?: string;
}

export const MOCK_SESSIONS = [
  { id: 's1', label: '2026-10-06 · Individual' },
  { id: 's2', label: '2026-10-13 · Individual' },
  { id: 's3', label: '2026-10-20 · Individual' },
  { id: 's4', label: '2026-10-22 · Group' },
  { id: 's5', label: '2026-10-24 · Individual' },
  { id: 's6', label: '2026-10-27 · Individual' },
];

export const emptySections = (): Record<SectionKey, SectionValue> => ({
  concern: { text: '', ai: 'none' },
  background: { text: '', ai: 'none' },
  assessment: { text: '', ai: 'none' },
  formulation: { text: '', ai: 'none' },
  plan: { text: '', ai: 'none' },
  ethics: { text: '', ai: 'none' },
});

export const MOCK_CASES: CaseDetail[] = [
  {
    id: '1',
    caseRef: 'C-014',
    focus: 'Adolescent, exam-related anxiety and sleep difficulty, 6 sessions to date.',
    updated: '2026-10-26',
    status: 'reviewed',
    sessionsLinked: 6,
    sectionsDone: 6,
    sectionsTotal: 6,
    aiAssisted: true,
    rating: 4.0,
    linkedSessionIds: ['s1', 's2', 's3', 's4', 's5', 's6'],
    supervisorFeedback:
      'Clear formulation and a realistic plan. Next time, name the protective factors more explicitly and say how you will measure sleep improvement.',
    sections: {
      concern: { text: 'Adolescent referred by school for persistent worry about exams, with trouble sleeping for about two months.', ai: 'reviewed' },
      background: { text: 'Lives with parents and one sibling. Strong academic expectations at home. No significant medical history reported.', ai: 'none' },
      assessment: { text: 'Anxiety measure in the moderate range. No current risk indicators. Sleep averages about five hours on school nights.', ai: 'reviewed' },
      formulation: { text: 'Exam pressure triggers catastrophic thinking, which keeps sleep poor and worry high. Supportive sibling and a strong interest in sport are protective.', ai: 'none' },
      plan: { text: 'Weekly sessions for eight weeks: sleep routine, relaxation skills, and challenging worry thoughts. Review the anxiety measure at session four and eight.', ai: 'none' },
      ethics: { text: 'Consent from the guardian and assent from the client are on file. Limits of confidentiality explained in the first session.', ai: 'none' },
    },
  },
  {
    id: '2',
    caseRef: 'C-015',
    focus: 'Adult, work-related burnout and low motivation, early assessment stage.',
    updated: '2026-10-27',
    status: 'draft',
    sessionsLinked: 2,
    sectionsDone: 3,
    sectionsTotal: 6,
    aiAssisted: true,
    linkedSessionIds: ['s1', 's2'],
    sections: {
      concern: { text: 'Adult reporting exhaustion, low motivation and irritability at work over the past four months.', ai: 'none' },
      background: { text: 'Mid-career professional, recent increase in workload and a change of manager. Lives with a partner.', ai: 'pending' },
      assessment: { text: 'Burnout screening score is elevated. No risk indicators noted in the first two sessions.', ai: 'none' },
      formulation: { text: '', ai: 'none' },
      plan: { text: '', ai: 'none' },
      ethics: { text: '', ai: 'none' },
    },
  },
  {
    id: '3',
    caseRef: 'G-003',
    focus: 'Group of 6, peer conflict and group cohesion; formulation under review.',
    updated: '2026-10-24',
    status: 'submitted',
    sessionsLinked: 4,
    sectionsDone: 6,
    sectionsTotal: 6,
    aiAssisted: false,
    linkedSessionIds: ['s1', 's2', 's3', 's4'],
    sections: {
      concern: { text: 'Six members with recurring conflict between two subgroups, affecting participation and trust.', ai: 'none' },
      background: { text: 'Members share a class and know each other outside the group. The conflict began before the group started.', ai: 'none' },
      assessment: { text: 'Observation across four sessions shows one subgroup dominating discussion. No individual risk concerns.', ai: 'none' },
      formulation: { text: 'Existing alliances carry into the group and limit openness. Quieter members withdraw, which reinforces the dominance pattern.', ai: 'none' },
      plan: { text: 'Structured rounds, shared group agreements, and a session on communication styles. Review cohesion after three more sessions.', ai: 'none' },
      ethics: { text: 'Group confidentiality agreement signed by all members. Guardian consent on file for members under 18.', ai: 'none' },
    },
  },
  {
    id: '4',
    caseRef: 'C-011',
    focus: 'Young adult, grief following family loss; intervention plan needs more detail.',
    updated: '2026-10-21',
    status: 'revision',
    sessionsLinked: 5,
    sectionsDone: 5,
    sectionsTotal: 6,
    aiAssisted: false,
    linkedSessionIds: ['s1', 's2', 's3', 's5', 's6'],
    supervisorFeedback:
      'The intervention plan needs measurable goals and a timeline. Please also complete the ethical and cultural section, especially religious and family practices around mourning.',
    sections: {
      concern: { text: 'Young adult with ongoing sadness and difficulty concentrating after the loss of a parent four months ago.', ai: 'none' },
      background: { text: 'Eldest sibling, now carrying more family responsibilities. Close to extended family. No previous counseling.', ai: 'none' },
      assessment: { text: 'Grief symptoms present but functioning is maintained. No risk indicators. Sleep and appetite mildly affected.', ai: 'none' },
      formulation: { text: 'Loss combined with new family responsibilities leaves little room to grieve. Family support is a strong protective factor.', ai: 'none' },
      plan: { text: 'Continue weekly sessions focused on grief processing.', ai: 'none' },
      ethics: { text: '', ai: 'none' },
    },
  },
];

export const findCase = (id?: string) => MOCK_CASES.find((c) => c.id === id);
