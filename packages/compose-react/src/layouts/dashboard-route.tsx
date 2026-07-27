import type { Menu } from "@/types";
import { Navigate, Outlet, useParams } from "react-router";
import { DashboardLayout } from "./dashboard-layout";
import type { LayoutProps } from "./layout.types";

// Menu paths owned by another scope (handled by their own route wrapper) that
// must NOT be rewritten with this subtree's itemId. Everything else under
// `/app/` is scoped by default, so new sections need no config.
const DEFAULT_EXCLUDE_PREFIXES = ["/app/project"];

export type DashboardRouteProps = LayoutProps & {
  /** Where to redirect when the itemId is missing or does not resolve. */
  consolePath?: "/app/console";
  /** Route param that holds the project itemId. */
  paramName?: string;
  /**
   * Menu path prefixes owned by another scope (e.g. project) or global
   * routes, which should NOT carry this subtree's itemId. Every other `/app/*`
   * menu path is scoped automatically.
   */
  excludePrefixes?: string[];
};

/**
 * Rewrites menu paths to carry the active project itemId
 * (`/app/<rest>` → `/app/<itemId>/<rest>`) for every `/app/*` menu whose path is
 * not owned by an excluded scope, recursing into `children`. The scoped paths
 * are derived from the menus themselves — no parallel allow-list to maintain.
 */
const withScopedItemId = (
  menus: Menu[],
  itemId: string,
  excludePrefixes: string[],
): Menu[] =>
  menus.map((menu) => {
    if (menu.type !== "menu") return menu;

    const isScoped =
      menu.path.startsWith("/app/") &&
      !excludePrefixes.some((prefix) => menu.path.startsWith(prefix));
    const path = isScoped
      ? menu.path.replace(/^\/app\//, `/app/${itemId}/`)
      : menu.path;
    const children = menu.children
      ? withScopedItemId(menu.children, itemId, excludePrefixes)
      : menu.children;

    return { ...menu, path, children };
  });

export function DashboardRoute({
  redirectPaths,
  navigationMenus,
  forwardedTo,
  consolePath = "/app/console",
  paramName = "itemId",
  excludePrefixes = DEFAULT_EXCLUDE_PREFIXES,
}: DashboardRouteProps) {
  const params = useParams();
  const itemId = params[paramName] ?? null;

  if (!itemId) return <Navigate to={consolePath} replace />;

  return (
    <DashboardLayout
      redirectPaths={redirectPaths}
      navigationMenus={withScopedItemId(
        navigationMenus,
        itemId,
        excludePrefixes,
      )}
      // Keep the active project when switching Blocks apps. Without this the
      // app switcher falls back to inferring the path from window.location and
      // lands on the console, since `/app/<itemId>/...` matches no static path.
      forwardedTo={forwardedTo ?? `/app/${itemId}/dashboard`}
    >
      <Outlet />
    </DashboardLayout>
  );
}
