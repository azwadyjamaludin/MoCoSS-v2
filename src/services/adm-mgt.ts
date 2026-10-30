import { DEV_APP } from '@/data/dev-app';
import { mockAdminCriteria, mockAssignments, mockOverview, mockUsers, type AdminUser, type Assignment, type Overview, } from '@/data/mock/admin';
import type { Criterion } from '@/data/mock/fullMark';
import { apiFetch } from '@/services/api';

const BASE = '/api/adm-mgt';

export async function fetchUsers(q?: string): Promise<AdminUser[]> {
  if (DEV_APP) {
    const needle = (q ?? '').trim().toLowerCase();
    return mockUsers.filter(
      (u) => !needle || (u.full_name ?? '').toLowerCase().includes(needle) || u.email.toLowerCase().includes(needle),
    );
  }
  return apiFetch<AdminUser[]>(`${BASE}/users${q?.trim() ? `?q=${encodeURIComponent(q.trim())}` : ''}`);
}

export async function updateUser(id: number, patch: { role?: string; is_active?: boolean }): Promise<AdminUser> {
  if (!DEV_APP) return apiFetch<AdminUser>(`${BASE}/users/${id}`, { method: 'PATCH', body: patch });
  const user = mockUsers.find((u) => u.id === id);
  if (!user) throw new Error('User not found.');
  Object.assign(user, patch);
  return user;
}

export const fetchAssignments = async (): Promise<Assignment[]> =>
  DEV_APP ? [...mockAssignments] : apiFetch<Assignment[]>(`${BASE}/assignments`);

export async function createAssignment(supervisorId: number, superviseeId: number): Promise<Assignment> {
  if (!DEV_APP) {
    return apiFetch<Assignment>(`${BASE}/assignments`, {
      method: 'POST',
      body: { supervisor_id: supervisorId, supervisee_id: superviseeId },
    });
  }
  if (mockAssignments.some((a) => a.supervisor_id === supervisorId && a.supervisee_id === superviseeId)) {
    throw new Error('This assignment already exists.');
  }
  const sv = mockUsers.find((u) => u.id === supervisorId);
  const se = mockUsers.find((u) => u.id === superviseeId);
  const row: Assignment = {
    id: mockAssignments.reduce((m, a) => Math.max(m, a.id), 0) + 1,
    supervisor_id: supervisorId,
    supervisor_name: sv?.full_name ?? null,
    supervisee_id: superviseeId,
    supervisee_name: se?.full_name ?? null,
  };
  mockAssignments.push(row);
  return row;
}

export async function deleteAssignment(id: number): Promise<void> {
  if (!DEV_APP) {
    await apiFetch<void>(`${BASE}/assignments/${id}`, { method: 'DELETE' });
    return;
  }
  const index = mockAssignments.findIndex((a) => a.id === id);
  if (index !== -1) mockAssignments.splice(index, 1);
}

export type CriterionInput = Pick<Criterion, 'name' | 'description' | 'max_marks' | 'sort_order' | 'is_active'>;

export const fetchAllCriteria = async (): Promise<Criterion[]> =>
  DEV_APP ? [...mockAdminCriteria] : apiFetch<Criterion[]>(`${BASE}/criteria`);

export async function createCriterion(data: CriterionInput): Promise<Criterion> {
  if (!DEV_APP) return apiFetch<Criterion>(`${BASE}/criteria`, { method: 'POST', body: data });
  const row: Criterion = { ...data, id: mockAdminCriteria.reduce((m, c) => Math.max(m, c.id), 0) + 1 };
  mockAdminCriteria.push(row);
  return row;
}

export async function updateCriterion(id: number, data: CriterionInput): Promise<Criterion> {
  if (!DEV_APP) return apiFetch<Criterion>(`${BASE}/criteria/${id}`, { method: 'PUT', body: data });
  const row = mockAdminCriteria.find((c) => c.id === id);
  if (!row) throw new Error('Criterion not found.');
  Object.assign(row, data);
  return row;
}

export const fetchOverview = async (): Promise<Overview> =>
  DEV_APP ? mockOverview : apiFetch<Overview>(`${BASE}/reports/overview`);
