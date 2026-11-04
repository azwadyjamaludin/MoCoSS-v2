import { fetchSession, type CounselingSession, type SessionKind } from '@/services/counseling';
import { useEffect, useState } from 'react';

const POLL_MS = 4000;
const GIVE_UP_MS = 10 * 60 * 1000;
const WAITING = ['pending', 'processing'];

/**
 * Keeps refreshing one session until its AI step finishes (done, failed or skipped).
 * Pass null to stay idle.
 */
export function usePollSession(kind: SessionKind, id: number | null) {
  const [session, setSession] = useState<CounselingSession | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id === null) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const startedAt = Date.now();

    const tick = async () => {
      try {
        const latest = await fetchSession(kind, id);
        if (cancelled) return;
        setSession(latest);
        setError(null);
        if (WAITING.includes(latest.ai_status) && Date.now() - startedAt < GIVE_UP_MS) {
          timer = setTimeout(tick, POLL_MS);
        }
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : 'Could not load the result.');
        if (Date.now() - startedAt < GIVE_UP_MS) timer = setTimeout(tick, POLL_MS * 2); // network blip: try again
      }
    };
    tick();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [kind, id]);

  return { session, error };
}
