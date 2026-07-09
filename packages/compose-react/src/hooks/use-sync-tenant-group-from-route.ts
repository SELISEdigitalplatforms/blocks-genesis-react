import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useProjectStore } from "@/store";

/**
 * Keeps the project store's `selectedTenantGroup` in sync with the tenant-group
 * id carried in the URL.
 *
 * The URL is the source of truth for "which project am I viewing". Any entry
 * path into a project-scoped route — clicking, browser back/forward, deep-link,
 * or hard refresh — reconstructs the same URL, so hydrating the store from the
 * route param here makes all of them behave identically. Consumers keep reading
 * `selectedTenantGroup` from the store unchanged.
 *
 * @param paramName Route param that holds the tenant-group id. Defaults to
 *   `tenantGroupId`.
 * @returns The tenant-group id from the URL, or `null` when absent.
 */
export const useSyncTenantGroupFromRoute = (
  paramName = "tenantGroupId",
): string | null => {
  const params = useParams();
  const value = params[paramName] ?? null;
  const selectedTenantGroup = useProjectStore(
    (state) => state.selectedTenantGroup,
  );
  const setTenantGroup = useProjectStore((state) => state.setTenantGroup);

  useEffect(() => {
    if (value && value !== selectedTenantGroup) {
      setTenantGroup(value);
    }
    // Only re-sync when the URL value changes; store updates must not retrigger.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return value;
};
