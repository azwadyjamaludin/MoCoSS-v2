/** Tiny in-memory table used for DEV_APP mock mode. Data resets when the app reloads. */
export interface MemoryStore<T extends { id: number }> {
  list(): T[];
  get(id: number): T | undefined;
  create(data: Omit<T, 'id'>): T;
  update(id: number, data: Partial<T>): T;
  remove(id: number): void;
}

export function createMemoryStore<T extends { id: number }>(seed: T[]): MemoryStore<T> {
  let rows = [...seed];
  let nextId = rows.reduce((max, r) => Math.max(max, r.id), 0) + 1;

  return {
    list: () => [...rows],
    get: (id) => rows.find((r) => r.id === id),
    create: (data) => {
      const row = { ...data, id: nextId++ } as T;
      rows = [row, ...rows];
      return row;
    },
    update: (id, data) => {
      const index = rows.findIndex((r) => r.id === id);
      if (index === -1) throw new Error('Record not found.');
      rows[index] = { ...rows[index], ...data };
      return rows[index];
    },
    remove: (id) => {
      rows = rows.filter((r) => r.id !== id);
    },
  };
}
