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

  interface Window extends RuntimeEnvWindow {}
}

export const getRuntimeEnv = <K extends string>(key: K): string => {
  const windowValue =
    typeof window !== "undefined" ? window.__BLOCKS_ENV__?.[key] : undefined;
  console.log("getRuntimeEnv: windowValue sd", { key, windowValue });
  if (windowValue && !isPlaceholder(windowValue)) {
    return windowValue;
  }

  const metaEnvValue = (import.meta.env as Record<string, string | undefined>)[key];
  return metaEnvValue ?? "";
};

export const createRuntimeEnvGetter = <K extends string>() => {
  return (key: K) => getRuntimeEnv(key);
};
