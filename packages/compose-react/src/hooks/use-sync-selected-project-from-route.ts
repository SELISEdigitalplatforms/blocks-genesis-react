import { useEffect } from "react";
import { useParams } from "react-router-dom";
import type { IProject } from "@/models";
import { useProjectStore } from "@/store";
import { useGetProject } from "./use-project";

export type SyncSelectedProjectResult = {
  /** The itemId from the URL, or `null` when absent. */
  itemId: string | null;
  /** The resolved project, or `null` while loading / when not found. */
  project: IProject | null;
  isLoading: boolean;
  isError: boolean;
};

/**
 * Keeps the project store's `selectedProject` in sync with the project `itemId`
 * carried in the URL, by fetching the project on mount.
 *
 * The URL is the source of truth for the impersonated project: any entry path
 * into a dashboard route — clicking, browser back/forward, deep-link, or hard
 * refresh — reconstructs the same URL, so fetching the project from the route
 * `itemId` here restores `selectedProject` (and, via `setSelectedProject`, the
 * tenant group). The dashboard's impersonation synchronizer then picks up the
 * restored project. Consumers keep reading `selectedProject` from the store.
 *
 * Returns loading/error state so a route guard can redirect when the `itemId`
 * is missing or does not resolve to a real project.
 *
 * @param paramName Route param that holds the project itemId. Defaults to
 *   `itemId`.
 */
export const useSyncSelectedProjectFromRoute = (
  paramName = "itemId",
): SyncSelectedProjectResult => {
  const params = useParams();
  const itemId = params[paramName] ?? null;
  const setSelectedProject = useProjectStore(
    (state) => state.setSelectedProject,
  );

  const { data, isLoading, isError } = useGetProject({
    projectId: itemId ?? "",
  });
  const project = data?.data ?? null;

  // The query is keyed by `itemId`, so `project` always corresponds to the
  // current URL id — set it whenever the fetch resolves. (No `itemId` equality
  // re-check: the API may not echo the exact id, which would otherwise leave
  // `selectedProject` unset and the impersonated dashboard blank.)
  useEffect(() => {
    if (project) {
      setSelectedProject(project);
    }
  }, [project, setSelectedProject]);

  return { itemId, project, isLoading, isError };
};
