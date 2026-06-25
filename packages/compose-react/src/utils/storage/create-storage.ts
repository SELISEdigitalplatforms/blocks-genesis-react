type StorageOptions = {
  prefix?: string;
  ttlMs?: number;
};

type StoredValue<T> = {
  value: T;
  expiresAt?: number;
};

/**
 * Creates a localStorage/sessionStorage wrapper with optional key prefix and TTL.
 *
 * Behavior notes:
 * - No-ops in non-browser runtimes.
 * - `clear()` removes only prefixed keys when a prefix is provided.
 *
 * @param driver Storage backend (`"local"` or `"session"`).
 * @param options Prefix and TTL configuration.
 * @returns Typed storage adapter.
 */
export function createStorage(
  driver: "local" | "session" = "local",
  options: StorageOptions = {},
) {
  const { prefix = "", ttlMs } = options;

  const withPrefix = (key: string) => (prefix ? `${prefix}:${key}` : key);

  const store = (): Storage | null => {
    if (typeof window === "undefined") return null;
    return driver === "local" ? window.localStorage : window.sessionStorage;
  };

  return {
    /**
     * Reads a typed value by key.
     *
     * Expired values are removed and return `null`.
     */
    get<T>(rawKey: string): T | null {
      try {
        const raw = store()?.getItem(withPrefix(rawKey));
        if (!raw) return null;

        const parsed = JSON.parse(raw) as StoredValue<T>;

        if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
          store()?.removeItem(withPrefix(rawKey));
          return null;
        }

        return parsed.value;
      } catch {
        return null;
      }
    },

    /**
     * Writes a value by key.
     */
    set<T>(rawKey: string, value: T, customTtlMs?: number): void {
      const effectiveTtl = customTtlMs ?? ttlMs;
      const expiresAt = effectiveTtl ? Date.now() + effectiveTtl : undefined;
      store()?.setItem(
        withPrefix(rawKey),
        JSON.stringify({ value, expiresAt }),
      );
    },

    /**
     * Deletes a value by key.
     */
    delete(rawKey: string): void {
      store()?.removeItem(withPrefix(rawKey));
    },

    /**
     * Clears values from storage.
     *
     * Clears all keys when no prefix is configured; otherwise clears only prefixed keys.
     */
    clear(): void {
      const activeStore = store();
      if (!activeStore) return;

      if (!prefix) {
        activeStore.clear();
        return;
      }

      const keysToDelete: string[] = [];
      for (let index = 0; index < activeStore.length; index++) {
        const key = activeStore.key(index);
        if (key && key.startsWith(`${prefix}:`)) {
          keysToDelete.push(key);
        }
      }

      keysToDelete.forEach((key) => activeStore.removeItem(key));
    },
  };
}
