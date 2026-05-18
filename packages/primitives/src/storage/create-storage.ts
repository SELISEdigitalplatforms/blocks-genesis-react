/**
 * Storage options.
 * @param prefix - The prefix to use for the storage keys.
 * @param ttlMs - The TTL in milliseconds to use for the storage.
 */
type StorageOptions = {
  prefix?: string;
  ttlMs?: number;
};

/**
 * Stored value.
 * @param value - The value to store.
 * @param expiresAt - The expiration timestamp of the value.
 */
type StoredValue<T> = {
  value: T;
  expiresAt?: number;
};

/**
 * Create a storage instance.
 * @param driver - The storage driver to use. Defaults to local.
 * @param options - The storage options.
 * @returns The storage instance.
 */
export function createStorage(driver: "local" | "session" = "local", options: StorageOptions = {}) {
  const { prefix = "", ttlMs } = options;

  const key = (k: string) => (prefix ? `${prefix}:${k}` : k);

  const store = (): Storage | null => {
    if (typeof window === "undefined") return null;
    return driver === "local" ? window.localStorage : window.sessionStorage;
  };

  return {
    /**
     * Get a value from the storage by key.
     * @param rawKey - The raw key to retrieve the value from.
     * @returns The value of the item, or null if not found.
     */
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

    /**
     * Set a value in the storage by key.
     * @param rawKey - The raw key to set the value for.
     * @param value - The value to set.
     * @param customTtlMs - The custom TTL in milliseconds to use for the value.
     */
    set<T>(rawKey: string, value: T, customTtlMs?: number): void {
      const expiresAt = (customTtlMs ?? ttlMs) ? Date.now() + (customTtlMs ?? ttlMs!) : undefined;
      store()?.setItem(key(rawKey), JSON.stringify({ value, expiresAt }));
    },

    /**
     * Delete a value from the storage by key.
     * @param rawKey - The raw key to delete the value from.
     */
    delete(rawKey: string): void {
      store()?.removeItem(key(rawKey));
    },

    /**
     * Clear all items from the storage.
     */
    clear(): void {
      store()?.clear();
    },
  };
}
