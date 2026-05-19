/**
 * Formats a number as currency using `Intl.NumberFormat`.
 *
 * @param value Numeric amount to format.
 * @param currency ISO currency code. Defaults to `"USD"`.
 * @param locale BCP 47 locale string. Defaults to `"en-US"`.
 * @returns Localized currency string.
 */
export const formatCurrency = (value: number, currency = "USD", locale = "en-US"): string => {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(value);
};
