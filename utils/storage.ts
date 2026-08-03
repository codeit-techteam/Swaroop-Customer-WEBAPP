export const storage = {
  get<T>(key: string, fallback: T | null = null): T | null {
    if (typeof window === "undefined") return fallback;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw === null) return fallback;
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  },

  set<T>(key: string, value: T): void {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Ignore quota / private mode errors
    }
  },

  remove(key: string): void {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Ignore
    }
  },

  clear(): void {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.clear();
    } catch {
      // Ignore
    }
  },
};
