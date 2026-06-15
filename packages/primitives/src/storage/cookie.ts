/**
 * Allowed `SameSite` values for cookie writes.
 */
export type CookieSameSite = "Lax" | "Strict" | "None";

/**
 * Options used for cookie read/write behavior.
 */
export type CookieStoreOptions = {
  /** Cookie path scope. */
  path?: string;
  /** Cookie domain scope. */
  domain?: string;
  /** Adds `Secure` attribute when `true`. */
  secure?: boolean;
  /** Sets `SameSite` policy. */
  sameSite?: CookieSameSite;
  /** Absolute cookie expiration date. */
  expires?: Date;
  /** Relative expiration in seconds. */
  maxAge?: number;
  /** Optional custom encoder for persisted values. */
  encode?: (value: string) => string;
  /** Optional custom decoder for persisted values. */
  decode?: (value: string) => string;
};

/**
 * Cookie storage adapter interface.
 */
export type CookieStore = {
  /** Reads a cookie by name. */
  get: (name: string) => string | null;
  /** Writes a cookie value. */
  set: (name: string, value: string, options?: CookieStoreOptions) => void;
  /** Deletes a cookie by writing an expired value. */
  delete: (name: string, options?: Omit<CookieStoreOptions, "expires" | "maxAge">) => void;
};

const defaultEncode = (value: string) => encodeURIComponent(value);
const defaultDecode = (value: string) => decodeURIComponent(value);

const buildCookieOptions = (options: CookieStoreOptions = {}) => {
  const parts: string[] = [];

  if (options.path) parts.push(`path=${options.path}`);
  if (options.domain) parts.push(`domain=${options.domain}`);
  if (options.sameSite) parts.push(`samesite=${options.sameSite}`);
  if (options.secure) parts.push("secure");
  if (typeof options.maxAge === "number") parts.push(`max-age=${Math.floor(options.maxAge)}`);
  if (options.expires) parts.push(`expires=${options.expires.toUTCString()}`);

  return parts.length ? `; ${parts.join("; ")}` : "";
};

/**
 * Creates a browser cookie store with configurable defaults.
 *
 * Behavior notes:
 * - No-ops in non-browser runtimes.
 * - Defaults to `path=/` and `SameSite=Lax` for writes.
 *
 * @param defaultOptions Default options merged into every `set`/`delete` call.
 * @returns Cookie storage adapter.
 */
export function createCookieStore(defaultOptions: CookieStoreOptions = {}): CookieStore {
  const isBrowser = typeof document !== "undefined";

  const resolveEncode = (options?: CookieStoreOptions) => options?.encode ?? defaultOptions.encode ?? defaultEncode;
  const resolveDecode = (options?: CookieStoreOptions) => options?.decode ?? defaultOptions.decode ?? defaultDecode;

  return {
    get(name) {
      if (!isBrowser) return null;

      const namePrefix = `${name}=`;
      const cookieParts = document.cookie.split(";");

      for (const cookie of cookieParts) {
        const trimmed = cookie.trim();
        if (!trimmed.startsWith(namePrefix)) continue;

        const rawValue = trimmed.slice(namePrefix.length);
        try {
          return resolveDecode()(rawValue);
        } catch {
          return rawValue;
        }
      }

      return null;
    },

    set(name, value, options = {}) {
      if (!isBrowser) return;



      const mergedOptions: CookieStoreOptions = {
        path: "/",
        sameSite: "Lax",
        ...defaultOptions,
        ...options,

      };

      const encodedValue = resolveEncode(mergedOptions)(value ?? "");
      const cookieOptions = buildCookieOptions(mergedOptions);

      document.cookie = `${name}=${encodedValue}${cookieOptions}`;
    },

    delete(name, options = {}) {
      if (!isBrowser) return;

      this.set(name, "", {
        ...defaultOptions,
        ...options,
        expires: new Date(0),
      });
    },
  };
}
