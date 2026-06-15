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
