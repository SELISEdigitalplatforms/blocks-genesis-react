import { getRuntimeEnv } from "@/lib/runtime-env";

export interface I18nConfig {
  /** Origin of the localization service; `/api/Key/GetUilmFile` and `/api/Language/Gets` are called on it. */
  baseUrl?: () => string;
  /** Project key sent as `X-Blocks-Key`. */
  blocksKey?: () => string;
  /** Request timeout in ms. */
  timeoutMs?: number;
  /** Wait before a failed request is tried again, in ms. */
  retryAfterMs?: number;
}

const defaults: Required<I18nConfig> = {
  baseUrl: () => getRuntimeEnv("BLOCKS_LOCALIZATION_BASE_URL"),
  blocksKey: () => getRuntimeEnv("BLOCKS_X_BLOCKS_KEY"),
  timeoutMs: 3000,
  retryAfterMs: 30000,
};

let config: Required<I18nConfig> = { ...defaults };

export const configureI18n = (next: I18nConfig) => {
  config = { ...defaults, ...next };
};

export const i18nConfig = (): Required<I18nConfig> => config;

/**
 * GET on the localization service with the project key and a timeout. Resolves to the body
 * text, or `null` when the service is not configured or does not answer with 2xx.
 */
export const fetchFromLocalization = async (
  path: string,
): Promise<string | null> => {
  const baseUrl = config.baseUrl().replace(/\/$/, "");
  const blocksKey = config.blocksKey();
  if (!baseUrl || !blocksKey) return null;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), config.timeoutMs);
  try {
    const response = await fetch(`${baseUrl}${path}`, {
      headers: { "X-Blocks-Key": blocksKey },
      signal: controller.signal,
    });
    if (!response.ok) return null;
    return await response.text();
  } finally {
    clearTimeout(timer);
  }
};

/** True when the service can be asked at all (base URL and project key are set). */
export const isLocalizationConfigured = () =>
  !!config.baseUrl() && !!config.blocksKey();
