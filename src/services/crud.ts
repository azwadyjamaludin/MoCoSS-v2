import { DEV_APP } from '@/data/dev-app';
import type { MemoryStore } from '@/data/mock/memoryStore';
import { apiFetch } from '@/services/api';

export interface CrudService<T> {
  list(): Promise<T[]>;
  get(id: number): Promise<T>;
  create(data: Partial<T>): Promise<T>;
  update(id: number, data: Partial<T>): Promise<T>;
  remove(id: number): Promise<void>;
}

/**
 * CRUD against a backend route like /api/reflect.
 * With DEV_APP=true it uses the in-memory mock store instead of the endpoint.
 */
export function makeCrudService<T extends { id: number }>(path: string, store: MemoryStore<T>): CrudService<T> {
  return {
    list: async () => (DEV_APP ? store.list() : apiFetch<T[]>(`${path}/`)),
    get: async (id) => {
      if (!DEV_APP) return apiFetch<T>(`${path}/${id}`);
      const row = store.get(id);
      if (!row) throw new Error('Record not found.');
      return row;
    },
    create: async (data) =>
      DEV_APP ? store.create(data as Omit<T, 'id'>) : apiFetch<T>(`${path}/`, { method: 'POST', body: data }),
    update: async (id, data) =>
      DEV_APP ? store.update(id, data) : apiFetch<T>(`${path}/${id}`, { method: 'PUT', body: data }),
    remove: async (id) => {
      if (DEV_APP) store.remove(id);
      else await apiFetch<void>(`${path}/${id}`, { method: 'DELETE' });
    },
  };
}
