import type { LogEntry } from '@/components/modules/LogEntryCard';

// Temporary mock data. Replace with the backend (GET /api/logBook/entries and /entries/:id).

export interface LogEntryDetail extends LogEntry {
  activity: string;
  learning: string;
  supervisorComment?: string;
}

export const MOCK_LOG_ENTRIES: LogEntryDetail[] = [
  {
    id: '1',
    date: '2026-10-20',
    hours: 1.5,
    category: 'individual',
    caseRef: 'C-014',
    status: 'approved',
    activity:
      'Initial session on exam-related anxiety. Built rapport, explored the sleep routine and agreed on a short relaxation task for the week.',
    learning: 'I rushed the closing. Next time I will leave five minutes for a summary and a check-in on how the client felt.',
  },
  {
    id: '2',
    date: '2026-10-22',
    hours: 2,
    category: 'group',
    caseRef: 'G-003',
    status: 'submitted',
    activity:
      'Co-facilitated a group session on peer conflict. Used a structured round so each member could speak, then a short grounding exercise.',
    learning: 'One member dominated the discussion. I want to discuss ways to balance participation without singling anyone out.',
  },
  {
    id: '3',
    date: '2026-10-25',
    hours: 1,
    category: 'supervision',
    status: 'returned',
    activity: 'Supervision meeting.',
    learning: '',
    supervisorComment:
      'Please say more about what was discussed in supervision, and add a case code if it relates to a specific case. Then submit again.',
  },
  {
    id: '4',
    date: '2026-10-27',
    hours: 1.5,
    category: 'individual',
    caseRef: 'C-015',
    status: 'draft',
    activity: 'Early assessment session on work-related burnout. Gathered background and discussed what the client wants from counseling.',
    learning: '',
  },
];

export const findLogEntry = (id?: string) => MOCK_LOG_ENTRIES.find((e) => e.id === id);
