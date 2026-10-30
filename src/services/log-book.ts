import type { LogCategory } from '@/components/modules/LogEntryCard';
import type { LogEntryDetail } from '@/data/mock/logBook';

// Shape returned by GET /api/log-book/ (MoCoSS-backend, models/logBook.py)
export interface LogBookApiRecord {
  id: number;
  user_id: number;
  activity_title: string;
  session_date: string; // 'YYYY-MM-DD'
  duration_minutes: number | null;
  category: string | null; // Individual, Group, Consultation, ...
  reflection_notes: string | null;
  created_at: string | null;
  updated_at: string | null;
}

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const CATEGORY_MAP: Record<string, LogCategory> = {
  individual: 'individual',
  group: 'group',
  supervision: 'supervision',
};

/**
 * The backend has no status, case code or supervisor comment yet, so:
 * - every entry is treated as 'submitted'
 * - activity_title -> activity, reflection_notes -> learning
 * - categories the app does not know (e.g. Consultation) become 'other'
 * Remove this mapping once the backend stores those fields.
 */
export function toLogEntryDetail(r: LogBookApiRecord): LogEntryDetail {
  return {
    id: String(r.id),
    date: r.session_date,
    hours: (r.duration_minutes ?? 60) / 60,
    category: CATEGORY_MAP[(r.category ?? '').trim().toLowerCase()] ?? 'other',
    status: 'submitted',
    activity: r.activity_title,
    learning: r.reflection_notes ?? '',
  };
}

export async function fetchLogEntries(userId?: number): Promise<LogEntryDetail[]> {
  const query = userId !== undefined ? `?user_id=${userId}` : '';
  const response = await fetch(`${API_URL}/api/log-book/${query}`);
  if (!response.ok) throw new Error(`Failed to load log book (${response.status})`);

  const json: { status: string; data: LogBookApiRecord[] } = await response.json();
  return json.data.map(toLogEntryDetail);
}
