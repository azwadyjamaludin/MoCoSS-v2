import type { RefConsStatus } from '@/components/modules/RefConsCard';
import type { RefConsDetail } from '@/data/mock/refCons';

// Shape returned by GET /api/ref-cons/ (MoCoSS-backend, models/refCons.py)
export interface RefConsApiRecord {
  id: number;
  user_id: number;
  referred_to: string;
  reason_for_referral: string;
  case_summary: string | null;
  status: string | null; // Pending, In Progress, Completed
  recommendations: string | null;
  created_at: string | null;
  updated_at: string | null;
}

const API_URL = process.env.EXPO_PUBLIC_API_URL;

function toStatus(r: RefConsApiRecord): RefConsStatus {
  if (r.recommendations) return 'responded';
  switch ((r.status ?? '').trim().toLowerCase()) {
    case 'completed':
      return 'closed';
    default: // Pending, In Progress
      return 'submitted';
  }
}

/**
 * The backend only stores referrals, so every record has kind 'referral'.
 * - referred_to -> target
 * - reason_for_referral -> topic and reason
 * - case_summary -> workSoFar
 * - recommendations -> response
 * Remove this mapping once the backend also stores consultations.
 */
export function toRefConsDetail(r: RefConsApiRecord): RefConsDetail {
  return {
    id: String(r.id),
    kind: 'referral',
    topic: r.reason_for_referral,
    target: r.referred_to,
    updated: r.updated_at ?? r.created_at ?? new Date().toISOString(),
    status: toStatus(r),
    targetKey: 'other',
    reason: r.reason_for_referral,
    workSoFar: r.case_summary ?? undefined,
    response: r.recommendations ?? undefined,
  };
}

export async function fetchRefCons(userId?: number): Promise<RefConsDetail[]> {
  const query = userId !== undefined ? `?user_id=${userId}` : '';
  const response = await fetch(`${API_URL}/api/ref-cons/${query}`);
  if (!response.ok) throw new Error(`Failed to load referrals (${response.status})`);

  const json: { status: string; data: RefConsApiRecord[] } = await response.json();
  return json.data.map(toRefConsDetail);
}
