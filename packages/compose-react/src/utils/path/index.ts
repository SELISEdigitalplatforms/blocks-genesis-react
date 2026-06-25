import type { ForwardToPaths } from "@/types";

const allowedPaths: ForwardToPaths[] = [
  "/app/console",
  "/app/dashboard",
  "/app/profile",
  "/app/project-overview/environments",
  "/app/create-project",
];
/**
 * Get the appropriate forwardedTo path based on the current location
 * @param pathname - Optional: The current pathname (useLocation().pathname), defaults to window.location.pathname
 * @returns A valid ForwardToPaths value
 */
export function getForwardedToPath(pathname?: string): ForwardToPaths {
  const currentPath =
    pathname ??
    (typeof window !== "undefined" ? window.location.pathname : "/app/console");

  // Check if the path is exactly one of the allowed paths
  if (allowedPaths.includes(currentPath as ForwardToPaths)) {
    return currentPath as ForwardToPaths;
  }

  // If not, check if it starts with any of the allowed paths (for nested paths)
  for (const allowedPath of allowedPaths) {
    if (currentPath.startsWith(allowedPath)) {
      return allowedPath;
    }
  }

  // Fallback to /app/console
  return "/app/console";
}
