/**
 * Formats a number using `Intl.NumberFormat`.
 *
 * @param value Number to format.
 * @param options Intl format options.
 * @param locale BCP 47 locale string. Defaults to `"en-US"`.
 * @returns Localized number string.
 */
export const formatNumber = (
  value: number,
  options: Intl.NumberFormatOptions = {
    notation: "compact",
    maximumFractionDigits: 1,
  },
  locale = "en-US",
): string => {
  return new Intl.NumberFormat(locale, options).format(value);
};
