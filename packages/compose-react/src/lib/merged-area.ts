import { getRuntimeEnv } from "@/lib/runtime-env";

/**
 * Base-URL keys of the areas folded into blocks-os-net-react. Their APIs and pages are served by the os host
 * (`BLOCKS_OS_BASE_URL`); the old logic, localization, data and monitor hosts are retired.
 */
export const MERGED_AREA_KEYS = [
  "BLOCKS_LOGIC_BASE_URL",
  "BLOCKS_LOCALIZATION_BASE_URL",
  "BLOCKS_DATA_BASE_URL",
  "BLOCKS_MONITOR_BASE_URL",
] as const;

export type MergedAreaKey = (typeof MERGED_AREA_KEYS)[number];

export const isMergedAreaKey = (key: string): key is MergedAreaKey =>
  (MERGED_AREA_KEYS as readonly string[]).includes(key);

/**
 * Base URL for a merged area: the area's own key while the app still sets it, else the os host.
 *
 * The area key wins on purpose. In an environment where blocks-os-net-react is not live yet, `BLOCKS_OS_BASE_URL` is
 * still the old os app, which does not serve the area's paths; an app keeps working there until its area keys are
 * removed from its runtime config, and from then on calls the os host.
 */
export const getMergedAreaBaseUrl = (key: MergedAreaKey): string =>
  getRuntimeEnv(key) || getRuntimeEnv("BLOCKS_OS_BASE_URL");
