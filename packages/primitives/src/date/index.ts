const pad = (num: number): string => num.toString().padStart(2, "0");
/**
 * Date formatter.
 * @param date - The date to format.
 * @param shouldOmitTime - Whether to omit the time component.
 * @returns The formatted date.
 * @example
 * formatFullDate(new Date()); // "Jan 1, 2023 at 12:00"
 * @example
 * formatFullDate(new Date(), true); // "Jan 1, 2023"
 * */
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
 * Date formatter.
 * @param date - The date to format.
 * @param options - The date format options.
 * @param locale - The locale to use.
 * @returns The formatted date.
 * @example
 * formatDate(new Date()); // "2023-01-01"
 * @example
 * formatDate(new Date(), { month: "short" }); // "Jan 1, 2023"
 * */
export const formatDate = (
  date: Date | string | number,
  options: Intl.DateTimeFormatOptions | boolean = {
    month: "long",
    day: "numeric",
    year: "numeric",
  },
  locale = "en-US",
): string => {
  const d = new Date(date);
  if (typeof options === "boolean") {
    const withoutTime = options;
    const dateStr = `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
    const timeStr = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
    if (withoutTime) return `${dateStr}`;
    return `${dateStr}, ${timeStr}`;
  }
  return new Intl.DateTimeFormat(locale, options).format(d);
};

/**
 * Date comparator.
 * @param firstDateString - The first date string to compare.
 * @param secondDateString - The second date string to compare.
 * @returns The comparison result.
 * @example
 * compareDates("2023-01-01", "2023-01-02"); // -1
 * @example
 * compareDates("2023-01-01", "2023-01-01"); // 0
 * @example
 * compareDates("2023-01-01", "2023-01-02"); // 1
 * */
export function compareDates(firstDateString: string, secondDateString: string): number {
  const dateA = new Date(firstDateString);
  const dateB = new Date(secondDateString);
  return dateA.getTime() - dateB.getTime();
}
