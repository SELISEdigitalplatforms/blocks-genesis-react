type StorageOptions = {
  prefix?: string;
  ttlMs?: number;
};

type StoredValue<T> = {
  value: T;
  expiresAt?: number;
};

export function createStorage(driver: "local" | "session" = "local", options: StorageOptions = {}) {
  const { prefix = "", ttlMs } = options;

  const key = (k: string) => (prefix ? `${prefix}:${k}` : k);

  const store = (): Storage | null => {
    if (typeof window === "undefined") return null;
    return driver === "local" ? window.localStorage : window.sessionStorage;
  };

  return {
    get<T>(rawKey: string): T | null {
      try {
        const raw = store()?.getItem(key(rawKey));
        if (!raw) return null;
        const parsed: StoredValue<T> = JSON.parse(raw);
        if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
          store()?.removeItem(key(rawKey));
          return null;
        }
        return parsed.value;
      } catch {
        return null;
      }
    },

    set<T>(rawKey: string, value: T, customTtlMs?: number): void {
      const expiresAt = (customTtlMs ?? ttlMs) ? Date.now() + (customTtlMs ?? ttlMs!) : undefined;
      store()?.setItem(key(rawKey), JSON.stringify({ value, expiresAt }));
    },

    delete(rawKey: string): void {
      store()?.removeItem(key(rawKey));
    },

    clear(): void {
      store()?.clear();
    },
  };
}
