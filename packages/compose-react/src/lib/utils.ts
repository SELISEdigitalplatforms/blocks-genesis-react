import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { ForwardToPaths } from "@/types/navigation.types";

/**
 * Conditionally compose Tailwind class names with conflict resolution.
 * The single function every component reaches for.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const pad = (num: number): string => num.toString().padStart(2, "0");
export const formatFullDate = (date: Date, withoutTime?: boolean): string => {
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const dateStr = `${monthNames[date.getMonth()]} ${pad(date.getDate())}, ${date.getFullYear()}`;
  const timeStr = `${pad(date.getHours())}:${pad(date.getMinutes())}`;
  if (withoutTime) return dateStr;
  return `${dateStr} at ${timeStr}`;
};

const allowedPaths: ForwardToPaths[] = [
  "console",
  "dashboard",
  "profile",
  "project-overview/environments",
];
/**
 * Get the appropriate forwardedTo path based on the current location
 * @param pathname - Optional: The current pathname (useLocation().pathname), defaults to window.location.pathname
 * @returns A valid ForwardToPaths value
 */
export function getForwardedToPath(pathname?: string): ForwardToPaths {
  const currentPath =
    pathname ??
    (typeof window !== "undefined" ? window.location.pathname : "console");

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

  // Fallback to /console
  return "console";
}
