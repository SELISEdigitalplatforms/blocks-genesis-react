/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { isValid as isValidDate, isBefore } from "date-fns";

/**
 * Conditionally compose Tailwind class names with conflict resolution.
 * The single function every component reaches for.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Pads a number with leading zeros to ensure it's at least 2 digits long.
 */
const pad = (num: number): string => num.toString().padStart(2, "0");

/**
 * Formats a Date object into a string in the format "DD/MM/YYYY, HH:mm".
 */
export const formatDate = (date: Date, withoutTime?: boolean): string => {
  const dateStr = `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
  const timeStr = `${pad(date.getHours())}:${pad(date.getMinutes())}`;
  if (withoutTime) return `${dateStr}`;
  return `${dateStr}, ${timeStr}`;
};

/**
 * Formats a Date object into a string in the format "MMM DD, YYYY at HH:mm".
 */
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

/**
 * Parses a date string in ISO 8601 format "YYYY-MM-DDTHH:mm:ss" into a Date object.
 */
export function parseDateString(dateString: string): Date {
  return new Date(dateString);
}

/**
 * Compares two date strings in ISO 8601 format for sorting.
 */
export function compareDates(dateStringA: string, dateStringB: string): number {
  const dateA = new Date(dateStringA);
  const dateB = new Date(dateStringB);
  return dateA.getTime() - dateB.getTime();
}

/**
 * Trailing-edge debounce helper. Returns a function with a `.cancel()` method.
 */
export const debounce = (fn: Function, ms = 300) => {
  let timeoutId: ReturnType<typeof setTimeout> | null;
  const debounced = function (this: unknown, ...args: unknown[]) {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), ms);
  };

  debounced.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  return debounced;
};

/**
 * Strips MongoDB extended JSON wrappers (`ISODate(...)`, `ObjectId(...)`,
 * `{"$date": ...}`, `NumberLong(...)`) so the result is parseable JSON.
 */
export const parseMongoDBString = (text: string) => {
  return text
    .replace(/(?:ISODate|ObjectId)\("([^"]+)"\)/g, '"$1"')
    .replace(/\{\s*"\$date"\s*:\s*"([^"]+)"\s*\}/g, '"$1"')
    .replace(/NumberLong\((\d+)\)/g, "$1");
};

/**
 * Returns true when the supplied value parses to a valid date on/after 1900-01-01.
 */
export const checkValidDate = (date: string | Date) => {
  const isValid = isValidDate(new Date(date));
  if (!isValid) return false;
  const targetDate = new Date("1900-01-01");
  if (isBefore(new Date(date), targetDate)) return false;
  return true;
};

/**
 * Recursive structural equality check for plain objects/arrays/primitives.
 */
export const deepEqual = (obj1: unknown, obj2: unknown): boolean => {
  if (obj1 === obj2) return true;
  if (typeof obj1 !== "object" || typeof obj2 !== "object" || obj1 === null || obj2 === null) {
    return false;
  }
  const obj1Record = obj1 as Record<string, unknown>;
  const obj2Record = obj2 as Record<string, unknown>;

  const keys1 = Object.keys(obj1Record);
  const keys2 = Object.keys(obj2Record);

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (const key of keys1) {
    if (!keys2.includes(key)) {
      return false;
    }
    if (!deepEqual(obj1Record[key], obj2Record[key])) {
      return false;
    }
  }
  return true;
};

/**
 * Removes every query-string parameter from the current URL except the keys
 * listed in `options.except`. Updates history with `replaceState`.
 */
export const clearQueryString = (options?: { except?: string[] }) => {
  const url = new URL(window.location.href);
  const newParams = new URLSearchParams();

  const keysToKeep = options?.except ?? [];

  keysToKeep.forEach((key) => {
    const value = url.searchParams.get(key);
    if (value !== null) {
      newParams.set(key, value);
    }
  });

  url.search = newParams.toString();
  window.history.replaceState(null, "", url.toString());
};

/**
 * Returns a short ID of the form "BLK-<timestamp>-<6 random uppercase letters>".
 */
export const getUniqueID = (): string => {
  const timestamp = Date.now();

  const randomLetters = Array.from({ length: 6 }, () =>
    String.fromCharCode(Math.floor(Math.random() * (90 - 65 + 1)) + 65),
  ).join("");

  return `BLK-${timestamp}-${randomLetters}`;
};

/**
 * Pretty-prints a byte size, scaling to KB/MB/GB/TB as needed.
 */
export function formatSize(
  value: number,
  inputUnit: "B" | "KB" | "MB" | "GB" | "TB" = "B",
  decimals: number = 2,
): string {
  const UNIT_MAP: Record<"B" | "KB" | "MB" | "GB" | "TB", number> = {
    B: 1,
    KB: 1024,
    MB: 1024 ** 2,
    GB: 1024 ** 3,
    TB: 1024 ** 4,
  };

  let bytes = value * UNIT_MAP[inputUnit];
  const UNITS = ["B", "KB", "MB", "GB", "TB"] as const;
  let unitIndex = 0;

  while (unitIndex < UNITS.length - 1 && bytes >= 1024) {
    bytes /= 1024;
    unitIndex++;
  }

  return `${parseFloat(bytes.toFixed(decimals))} ${UNITS[unitIndex]}`;
}
