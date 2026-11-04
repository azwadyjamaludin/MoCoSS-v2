import { DEV_APP } from '@/data/dev-app';
import { ApiError } from '@/services/api';
import * as SecureStore from 'expo-secure-store';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export type SessionKind = 'indCoun' | 'grpCoun';
export type AiStatus = 'none' | 'pending' | 'processing' | 'done' | 'failed' | 'skipped';

// Shape returned by the backend (/api/indCoun/sessions, /api/grpCoun/sessions).
export interface AiFeedback {
  summary: string;
  strengths: string[];
  areas_to_improve: string[];
  skills_observed: string[];
  ethical_flags: string[];
  questions_for_supervision: string[];
  is_mock: boolean; // true = sample text, not based on the recording
}

export interface CounselingSession {
  id: number;
  title: string;
  case_code: string | null;
  client_status: string | null;
  session_notes: string | null;
  duration_minutes: number | null;
  has_audio: boolean;
  has_video: boolean;
  ai_status: AiStatus;
  ai_error: string | null;
  ai_generated_at: string | null;
  ai_feedback: AiFeedback | null;
  transcript: string | null;
  created_at: string | null;
}

export interface SessionUpload {
  caseCode: string; // de-identified code, never the client's name
  sessionNotes: string;
  clientStatus: string;
  durationHours: number;
  consent: boolean;
  language: 'BM' | 'EN';
  audioUri?: string;
  videoUri?: string;
}

async function authHeader(): Promise<Record<string, string>> {
  const token = await SecureStore.getItemAsync('userToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function readJson(response: Response) {
  const json = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiError(typeof json?.detail === 'string' ? json.detail : `HTTP ${response.status}`, response.status);
  }
  return json?.data;
}

// ---------------------------------------------------------------- DEV_APP mock
const MOCK_FEEDBACK: AiFeedback = {
  summary: 'Sample feedback for testing the screens. It is not based on a real recording.',
  strengths: ['Calm, warm tone.', 'Clear opening and check-in.'],
  areas_to_improve: ['Leave more room for silence.', 'Summarise before closing.'],
  skills_observed: ['Open questions', 'Paraphrasing'],
  ethical_flags: [],
  questions_for_supervision: ['How can I close the session more clearly?'],
  is_mock: true,
};
const mockSessions = new Map<string, { session: CounselingSession; createdAt: number }>();
let mockNextId = 1;

function mockFetch(kind: SessionKind, id: number): CounselingSession {
  const entry = mockSessions.get(`${kind}:${id}`);
  if (!entry) throw new ApiError('Session not found.', 404);
  const ready = Date.now() - entry.createdAt > 3000;
  if (ready && entry.session.ai_status === 'processing') {
    entry.session = { ...entry.session, ai_status: 'done', ai_feedback: MOCK_FEEDBACK, ai_generated_at: new Date().toISOString() };
  }
  return entry.session;
}

// ------------------------------------------------------------------ real calls
export async function submitSession(kind: SessionKind, input: SessionUpload): Promise<CounselingSession> {
  if (DEV_APP) {
    const hasMedia = !!(input.audioUri || input.videoUri);
    const session: CounselingSession = {
      id: mockNextId++,
      title: `${kind === 'indCoun' ? 'Individual' : 'Group'} session`,
      case_code: input.caseCode,
      client_status: input.clientStatus || null,
      session_notes: input.sessionNotes || null,
      duration_minutes: Math.round(input.durationHours * 60),
      has_audio: !!input.audioUri,
      has_video: !!input.videoUri,
      ai_status: hasMedia ? 'processing' : 'none',
      ai_error: null,
      ai_generated_at: null,
      ai_feedback: null,
      transcript: null,
      created_at: new Date().toISOString(),
    };
    mockSessions.set(`${kind}:${session.id}`, { session, createdAt: Date.now() });
    return session;
  }

  const form = new FormData();
  form.append('case_code', input.caseCode.trim());
  form.append('session_notes', input.sessionNotes);
  form.append('client_status', input.clientStatus);
  form.append('duration_hours', String(input.durationHours));
  form.append('consent', input.consent ? 'true' : 'false');
  form.append('language', input.language);
  if (input.audioUri) {
    form.append('audio', { uri: input.audioUri, name: input.audioUri.split('/').pop() || 'session.m4a', type: 'audio/m4a' } as any);
  }
  if (input.videoUri) {
    form.append('video', { uri: input.videoUri, name: input.videoUri.split('/').pop() || 'session.mp4', type: 'video/mp4' } as any);
  }

  // No Content-Type header on purpose: fetch must add the multipart boundary itself.
  const response = await fetch(`${API_URL}/api/${kind}/sessions`, {
    method: 'POST',
    headers: await authHeader(),
    body: form,
  });
  return readJson(response);
}

export async function fetchSession(kind: SessionKind, id: number): Promise<CounselingSession> {
  if (DEV_APP) return mockFetch(kind, id);
  const response = await fetch(`${API_URL}/api/${kind}/sessions/${id}`, { headers: await authHeader() });
  return readJson(response);
}
