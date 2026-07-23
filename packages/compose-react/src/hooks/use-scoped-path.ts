import { useParams } from "react-router-dom";

/**
 * Builds absolute paths scoped to the active project id in the URL
 * (`/app/:<paramName>/...`). Use inside a project-scoped subtree so links carry
 * the id without each call site having to read the route param.
 *
 * Pair it with {@link DashboardRoute} / {@link ProjectOverviewRoute}, which put
 * the id in the URL. App-specific base paths (e.g. an LMT section) can be built
 * on top: `const lmtBase = useScopedPath()("lmt")`.
 *
 * @param paramName Route param that holds the id. Defaults to `itemId`.
 * @returns `(sub) => "/app/<id>/<sub>"`.
 *
 * @example
 *   const scoped = useScopedPath();
 *   navigate(scoped(`idp/role-detail/${roleId}`));
 */
export const useScopedPath = (paramName = "itemId") => {
  const params = useParams();
  const id = params[paramName] ?? "";
  return (sub: string) => `/app/${id}/${sub.replace(/^\/+/, "")}`;
};
