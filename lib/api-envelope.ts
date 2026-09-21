export type Envelope<T> = {
  success: boolean;
  message?: string;
  data: T;
  meta?: { page: number; limit: number; total: number; totalPages: number };
};

export function num(value: unknown, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export function iso(value: unknown, fallback = new Date().toISOString()): string {
  if (!value) return fallback;
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? fallback : date.toISOString();
}

export function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

export async function paginateAll<T>(
  fetchPage: (page: number) => Promise<{ items: T[]; totalPages: number }>,
  maxPages = 10,
): Promise<T[]> {
  const items: T[] = [];
  let page = 1;
  let totalPages = 1;
  do {
    const result = await fetchPage(page);
    items.push(...result.items);
    totalPages = result.totalPages || 1;
    page += 1;
  } while (page <= totalPages && page <= maxPages);
  return items;
}
