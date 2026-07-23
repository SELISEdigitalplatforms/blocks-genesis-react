import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Conditionally compose Tailwind class names with conflict resolution.
 * The single function every component reaches for.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
