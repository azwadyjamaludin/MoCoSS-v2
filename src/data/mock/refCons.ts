import type { RefConsItem } from '@/components/modules/RefConsCard';

// Temporary mock data. Replace with the backend (GET /api/refCons/items and /items/:id).

export interface RefConsDetail extends RefConsItem {
  // Consultation
  consultant?: string; // 'supervisor' | 'peer' | 'other'
  situation?: string;
  reflection?: string;
  question?: string;
  // Referral
  targetKey?: string; // 'medical' | 'welfare' | 'education' | 'other'
  reason?: string;
  workSoFar?: string;
  consent?: boolean;
  // Reply from the consultant or the receiving service
  response?: string;
}

export const MOCK_REFCONS: RefConsDetail[] = [
  {
    id: '1',
    kind: 'consultation',
    topic: 'Unsure how to respond when a client asks for advice on a family decision',
    caseRef: 'C-014',
    target: 'Supervisor',
    updated: '2026-10-26',
    status: 'responded',
    ethical: true,
    consultant: 'supervisor',
    situation:
      'In session four the client asked me directly what I would do about a family decision. I said I could not decide for them, but the client seemed disappointed.',
    reflection: 'I felt pulled to rescue the client and then worried I had sounded cold. I noticed I wanted to be liked.',
    question: 'How do I stay supportive without giving advice, and how do I handle the client feeling let down?',
    response:
      'It is natural to want to help, but the decision belongs to the client. Next session, explore the options and the pressures around each one instead of advising. Name the disappointment openly. Let us go through your notes together on Thursday.',
  },
  {
    id: '2',
    kind: 'referral',
    topic: 'Persistent low mood and sleep problems, medical review recommended',
    caseRef: 'C-015',
    target: 'Psychiatrist / medical',
    updated: '2026-10-27',
    status: 'submitted',
    urgent: true,
    targetKey: 'medical',
    reason:
      'Low mood and poor sleep have continued for several months and are affecting work. A medical review is recommended to rule out other causes and consider further support.',
    workSoFar: 'Two sessions of assessment and supportive counseling. Sleep routine discussed. No risk indicators noted so far.',
    consent: true,
  },
  {
    id: '3',
    kind: 'consultation',
    topic: 'Feeling overwhelmed after a difficult group session',
    target: 'Peer',
    updated: '2026-10-22',
    status: 'draft',
    consultant: 'peer',
    situation: 'A group session became heated when two members argued, and I struggled to step in.',
    reflection: '',
    question: '',
  },
  {
    id: '4',
    kind: 'referral',
    topic: 'Financial hardship affecting attendance, welfare support needed',
    caseRef: 'C-011',
    target: 'Social welfare',
    updated: '2026-10-15',
    status: 'closed',
    targetKey: 'welfare',
    reason: 'The client has missed sessions because of transport costs and may qualify for welfare assistance.',
    workSoFar: 'Five sessions completed. Attendance has become irregular in the last month.',
    consent: true,
    response: 'A welfare officer was assigned and contacted the client. The case is closed on the welfare side.',
  },
];

export const findRefCons = (id?: string) => MOCK_REFCONS.find((r) => r.id === id);
