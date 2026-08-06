import type { ForwardToPaths } from "@/types";
import { getForwardedToPath } from "@/utils";

interface UseResolvedForwardedToParams {
  appForwardedTo?: ForwardToPaths;
  propForwardedTo?: ForwardToPaths;
}

/**
 * Resolve the `forwardedTo` path for a single app in the AppSwitcher.
 *
 * Precedence:
 * 1. Per-app default (`appForwardedTo`, e.g. IAM → `/app/profile`).
 * 2. Caller override via the `<AppSwitcher forwardedTo={...}>` prop.
 * 3. Current-page-aware fallback (`getForwardedToPath()`).
 */
export function useResolvedForwardedTo({
  appForwardedTo,
  propForwardedTo,
}: UseResolvedForwardedToParams): ForwardToPaths {
  return appForwardedTo ?? propForwardedTo ?? getForwardedToPath();
}
