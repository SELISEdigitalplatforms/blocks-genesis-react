import type { RuntimeKey } from "@/layouts";

const PLACEHOLDER_PREFIX = "__BLOCKS_";

const isPlaceholder = (value?: string) =>
  !!value && value.startsWith(PLACEHOLDER_PREFIX) && value.endsWith("__");

export interface RuntimeEnvWindow {
  __BLOCKS_ENV__?: Partial<Record<string, string>>;
}

declare global {
  interface ImportMeta {
    env: Record<string, string | undefined>;
  }
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface Window extends RuntimeEnvWindow {}
}

export const getRuntimeEnv = <K extends RuntimeKey>(key: K): string => {
  if (typeof window !== "undefined") {
    // 1. Check window.__BLOCKS_ENV__
    const windowValue = (window as Window).__BLOCKS_ENV__?.[key];
    if (windowValue && !isPlaceholder(windowValue)) return windowValue;

    // 2. Check window.process.env (Common in legacy/Vite apps)
    const processEnvValue = (window as Window).process?.env?.[key];
    if (processEnvValue && !isPlaceholder(processEnvValue))
      return processEnvValue;
  }

  // 3. Check import.meta.env
  const metaEnvValue = (import.meta.env as Record<string, string | undefined>)[
    key
  ];
  return metaEnvValue ?? "";
};

export const createRuntimeEnvGetter = <K extends RuntimeKey>() => {
  return (key: K) => getRuntimeEnv(key);
};
