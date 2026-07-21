/**
 * Formats a duration value into a human-readable string.
 *
 * @param value Duration value in milliseconds or seconds.
 * @param inputUnit Optional unit of the input value. Defaults to "ms".
 * @returns Formatted duration string.
 * @example
 * ```ts
 * const formatted = formatDuration(1234567890); // "1d 10h 17m 18s"
 * ```
 */
export function formatDuration(
  value: number,
  inputUnit: "ms" | "s" = "ms",
): string {
  const totalSeconds =
    inputUnit === "ms" ? Math.floor(value / 1000) : Math.floor(value);

  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  const units = [
    { value: days, label: "d" },
    { value: hours, label: "h" },
    { value: minutes, label: "m" },
    { value: secs, label: "s" },
  ];

  const nonZero = units.filter((u) => u.value > 0);
  if (!nonZero.length) return "0s";

  return nonZero
    .slice(0, 2)
    .map((u) => `${u.value}${u.label}`)
    .join(" ");
}
/**
 * Formats a duration value in seconds into a human-readable string.
 *
 * @param seconds Duration value in seconds.
 * @returns Formatted duration string.
 * @example
 * ```ts
 * const formatted = formatSeconds(1234567890); // "1d 10h 17m 18s"
 * ```
 */
export const formatSeconds = (seconds: number) => {
  if (seconds < 60) {
    return `${seconds}s`;
  }

  if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    return `${minutes}min`;
  }

  if (seconds < 86400) {
    const hours = Math.floor(seconds / 3600);
    return `${hours}h`;
  }

  const days = Math.floor(seconds / 86400);
  return `${days}d`;
};
