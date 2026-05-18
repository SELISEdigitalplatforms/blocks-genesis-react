/**
 * Number formatter.
 * @param value - The number to format.
 * @param options - The number format options.
 * @param locale - The locale to use.
 * @returns The formatted number.
 * @example
 * formatNumber(1234567890); // "123.457M"
 * @example
 * formatNumber(1234567890, { notation: "long" }); // "123,456,789,000"
 * */
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
