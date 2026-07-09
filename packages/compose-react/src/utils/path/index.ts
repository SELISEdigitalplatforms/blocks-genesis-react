import type { ForwardToPaths, ForwardToStaticPath } from "@/types";

const DEFAULT_PATH: ForwardToPaths = "/app/console";

/**
 * Segments directly under `/app/` that name an app page rather than a project
 * itemId. Anything else in that position is a project id, because project
 * routes are `/app/<itemId>/...`.
 */
const RESERVED_APP_SEGMENTS = new Set([
  "console",
  "profile",
  "create-project",
  "data-migration",
  "callback",
  "dashboard",
  "project",
]);

/** App pages that can be forwarded to as-is. */
const STATIC_PATHS: ForwardToStaticPath[] = [
  "/app/console",
  "/app/dashboard",
  "/app/profile",
  "/app/create-project",
];

/**
 * Resolve the `forwardedTo` path to hand to the IAM initiate endpoint when
 * switching between Blocks apps.
 *
 * Project routes carry the project id (`/app/<itemId>/...`), so a plain prefix
 * match against id-less paths never matches and would drop the user on the
 * console. Instead, detect the project id and forward to that project's
 * dashboard, which every Blocks app exposes.
 *
 * @param pathname Optional current pathname; defaults to `window.location.pathname`.
 */
export function getForwardedToPath(pathname?: string): ForwardToPaths {
  const currentPath =
    pathname ??
    (typeof window !== "undefined" ? window.location.pathname : DEFAULT_PATH);

  const [appSegment, secondSegment] = currentPath.split("/").filter(Boolean);
  if (appSegment !== "app" || !secondSegment) return DEFAULT_PATH;

  // `/app/<itemId>/...` — keep the project and land on its dashboard.
  if (!RESERVED_APP_SEGMENTS.has(secondSegment)) {
    return `/app/${secondSegment}/dashboard`;
  }

  // Project-overview (`/app/project/<tenantGroupId>/...`) is owned by blocks-os;
  // other apps have no such route, so send them to the console.
  if (secondSegment === "project") return DEFAULT_PATH;

  const staticPath = `/app/${secondSegment}` as ForwardToStaticPath;
  return STATIC_PATHS.includes(staticPath) ? staticPath : DEFAULT_PATH;
}
