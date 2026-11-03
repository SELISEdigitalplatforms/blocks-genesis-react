import { fetchFromLocalization, i18nConfig } from "./config";
import { cultureOf, DEFAULT_LANGUAGE, loadLanguages } from "./languages";
import { useI18nStore } from "./i18n.store";
import type { Dictionary } from "./translate";

export { configureI18n, type I18nConfig } from "./config";

const CACHE_PREFIX = "blocks-i18n:";

// Loaded (or loading) this page session, so each module is fetched once.
const requested = new Map<string, Promise<void>>();

/** Test helper: forgets which modules were requested. */
export const resetI18nRequests = () => requested.clear();

const cacheKey = (language: string, module: string) =>
  `${CACHE_PREFIX}${language}:${module}`;

// Keeps the text entries only: one null value in a published file must not
// drop the whole module.
const toDictionary = (value: unknown): Dictionary | null => {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return null;
  }
  const entries = Object.entries(value).filter(
    (entry): entry is [string, string] => typeof entry[1] === "string",
  );
  return entries.length > 0 ? Object.fromEntries(entries) : null;
};

const readCache = (language: string, module: string): Dictionary | null => {
  try {
    const raw = globalThis.localStorage?.getItem(cacheKey(language, module));
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return toDictionary(parsed);
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
  // The culture code comes from the project's languages (`en` → `en-US`).
  await loadLanguages();
  const query = new URLSearchParams({
    Language: cultureOf(language),
    ModuleName: module,
  });
  const text = await fetchFromLocalization(
    `/api/Key/GetUilmFile?${query.toString()}`,
  );
  if (!text) return null;
  const parsed: unknown = JSON.parse(text);
  return toDictionary(parsed);
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
    setTimeout(() => requested.delete(key), i18nConfig().retryAfterMs);
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
