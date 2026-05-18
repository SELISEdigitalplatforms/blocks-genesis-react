/**
 * Currency formatter.
 * @param value - The currency value to format.
 * @param currency - The currency code to use.
 * @param locale - The locale to use.
 * @returns The formatted currency value.
 * @example
 * formatCurrency(1000); // "1,000 USD"
 * @example
 * formatCurrency(1000, "EUR"); // "1,000 €"
 */
export const formatCurrency = (value: number, currency = "USD", locale = "en-US"): string => {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(value);
};
