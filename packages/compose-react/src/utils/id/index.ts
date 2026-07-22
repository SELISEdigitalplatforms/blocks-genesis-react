/**
 * Generates a random identifier.
 *
 * Uses `crypto.randomUUID` when available and falls back to a base36 random string.
 *
 * @returns Random identifier string.
 */
export function generateId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return Math.random().toString(36).slice(2, 11);
}

/**
 * Generates a unique identifier.
 *
 * @param options Optional configuration object.
 * @param options.prefix Optional prefix for the identifier.
 * @example
 * ```ts
 * const id = getUniqueID({ prefix: "MY-APP" }); // Generates "MY-APP-16345678901234567890"
 * ```
 *
 * @returns Unique identifier string.
 */
export const getUniqueID = (options?: { prefix?: string }): string => {
  const prefix = options?.prefix ?? "BLK";
  const timestamp = Date.now();
  const randomLetters = Array.from({ length: 6 }, () =>
    String.fromCharCode(Math.floor(Math.random() * (90 - 65 + 1)) + 65),
  ).join("");
  return `${prefix}-${timestamp}-${randomLetters}`;
};
