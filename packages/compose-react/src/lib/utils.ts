import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

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
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  const dateStr = `${monthNames[date.getMonth()]} ${pad(date.getDate())}, ${date.getFullYear()}`;
  const timeStr = `${pad(date.getHours())}:${pad(date.getMinutes())}`;
  if (withoutTime) return dateStr;
  return `${dateStr} at ${timeStr}`;
};