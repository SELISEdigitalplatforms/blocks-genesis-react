import { getRuntimeEnv } from "@/lib/runtime-env";
import { cultureOf, DEFAULT_LANGUAGE } from "./languages";
import { useI18nStore } from "./i18n.store";
import type { Dictionary } from "./translate";

export interface I18nConfig {
  /** Origin of the localization app; `/api/Key/GetUilmFile` is called on it. */
  baseUrl?: () => string;
  /** Project key sent as `X-Blocks-Key`. */
  blocksKey?: () => string;
  /** Request timeout in ms. */
  timeoutMs?: number;
  /** Wait before a failed module is requested again, in ms. */
  retryAfterMs?: number;
}

const CACHE_PREFIX = "blocks-i18n:";

const defaults: Required<I18nConfig> = {
  baseUrl: () => getRuntimeEnv("BLOCKS_LOCALIZATION_BASE_URL"),
  blocksKey: () => getRuntimeEnv("BLOCKS_X_BLOCKS_KEY"),
  timeoutMs: 3000,
  retryAfterMs: 30000,
};

let config: Required<I18nConfig> = { ...defaults };
// Loaded (or loading) this page session, so each module is fetched once.
const requested = new Map<string, Promise<void>>();

export const configureI18n = (next: I18nConfig) => {
  config = { ...defaults, ...next };
};

/** Test helper: forgets which modules were requested. */
export const resetI18nRequests = () => requested.clear();

const cacheKey = (language: string, module: string) =>
  `${CACHE_PREFIX}${language}:${module}`;

const isDictionary = (value: unknown): value is Dictionary =>
  typeof value === "object" &&
  value !== null &&
  !Array.isArray(value) &&
  Object.values(value).every((item) => typeof item === "string");

const readCache = (language: string, module: string): Dictionary | null => {
  try {
    const raw = globalThis.localStorage?.getItem(cacheKey(language, module));
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isDictionary(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

const writeCache = (language: string, module: string, value: Dictionary) => {
  try {
    globalThis.localStorage?.setItem(
      cacheKey(language, module),
      JSON.stringify(value),
    );
  } catch {
    // Storage full or blocked: the text still works for this session.
  }
};

const fetchModule = async (
  language: string,
  module: string,
): Promise<Dictionary | null> => {
  const baseUrl = config.baseUrl().replace(/\/$/, "");
  const blocksKey = config.blocksKey();
  if (!baseUrl || !blocksKey) return null;

  const query = new URLSearchParams({
    Language: cultureOf(language),
    ModuleName: module,
  });
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), config.timeoutMs);
  try {
    const response = await fetch(
      `${baseUrl}/api/Key/GetUilmFile?${query.toString()}`,
      { headers: { "X-Blocks-Key": blocksKey }, signal: controller.signal },
    );
    if (!response.ok) return null;
    const text = await response.text();
    if (!text) return null;
    const parsed: unknown = JSON.parse(text);
    return isDictionary(parsed) ? parsed : null;
  } finally {
    clearTimeout(timer);
  }
};

const load = async (language: string, module: string) => {
  const cached = readCache(language, module);
  if (cached) useI18nStore.getState().setRemote(language, module, cached);

  const key = `${language}:${module}`;
  try {
    const fresh = await fetchModule(language, module);
    if (!fresh) throw new Error(`No published file for ${key}`);
    useI18nStore.getState().setRemote(language, module, fresh);
    writeCache(language, module, fresh);
  } catch {
    // Service down, slow or not published: cached or bundled English is shown.
    setTimeout(() => requested.delete(key), config.retryAfterMs);
  }
};

/**
 * Loads the published text of one module in one language. English is never
 * fetched: the bundled English in the app is the source of truth. Safe to call
 * on every render; a module is requested once per page session.
 */
export const loadModule = (language: string, module: string) => {
  if (language === DEFAULT_LANGUAGE) return Promise.resolve();
  const key = `${language}:${module}`;
  let pending = requested.get(key);
  if (!pending) {
    pending = load(language, module);
    requested.set(key, pending);
  }
  return pending;
};
