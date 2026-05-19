const pad = (num: number): string => num.toString().padStart(2, "0");

/**
 * Formats a date into `Mon DD, YYYY` (with optional time).
 *
 * @param date Date instance.
 * @param shouldOmitTime When `true`, omits the `HH:mm` suffix.
 * @returns Formatted date string.
 */
export const formatFullDate = (date: Date, shouldOmitTime?: boolean): string => {
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
  if (shouldOmitTime) return dateStr;
  return `${dateStr} at ${timeStr}`;
};

/**
 * Formats a date with either legacy boolean formatting or Intl options.
 *
 * @param date Date-like input value.
 * @param options Intl options or legacy boolean flag (`true` = omit time).
 * @param locale BCP 47 locale string. Defaults to `"en-US"`.
 * @returns Formatted date string.
 */
export const formatDate = (
  date: Date | string | number,
  options: Intl.DateTimeFormatOptions | boolean = {
    month: "long",
    day: "numeric",
    year: "numeric",
  },
  locale = "en-US",
): string => {
  const normalizedDate = new Date(date);
  if (typeof options === "boolean") {
    const shouldOmitTime = options;
    const dateStr = `${pad(normalizedDate.getDate())}/${pad(normalizedDate.getMonth() + 1)}/${normalizedDate.getFullYear()}`;
    const timeStr = `${pad(normalizedDate.getHours())}:${pad(normalizedDate.getMinutes())}`;
    if (shouldOmitTime) return dateStr;
    return `${dateStr}, ${timeStr}`;
  }
  return new Intl.DateTimeFormat(locale, options).format(normalizedDate);
};

/**
 * Compares two date strings by epoch milliseconds.
 *
 * @param firstDateString First date string.
 * @param secondDateString Second date string.
 * @returns Negative when first date is earlier; positive when later; zero when equal.
 */
export function compareDates(firstDateString: string, secondDateString: string): number {
  const dateA = new Date(firstDateString);
  const dateB = new Date(secondDateString);
  return dateA.getTime() - dateB.getTime();
}
