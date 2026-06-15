import { isBefore, isValid } from "date-fns";

export * from "./schema";

/**
 * Validates email format using a simple RFC-like regex.
 *
 * @param email Email string.
 * @returns `true` when valid.
 */
export const isEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

/**
 * Validates URL format using the platform `URL` constructor.
 *
 * @param url URL string.
 * @returns `true` when valid.
 */
export const isUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validates UUID format (versions are not distinguished).
 *
 * @param uuid UUID string.
 * @returns `true` when valid.
 */
export const isUuid = (uuid: string): boolean => {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uuid);
};

/**
 * Validates E.164 phone number format.
 *
 * @param phone Phone string.
 * @returns `true` when valid.
 */
export const isPhone = (phone: string): boolean => {
  return /^\+[1-9]\d{1,14}$/.test(phone);
};

/**
 * Validates credit card number using the Luhn algorithm.
 *
 * @param card Credit card string (digits and separators supported).
 * @returns `true` when valid.
 */
export const isCreditCard = (card: string): boolean => {
  const nDigits = card.replace(/\D/g, "").length;
  if (nDigits < 13 || nDigits > 19) return false;

  let sum = 0;
  let shouldDouble = false;

  for (let index = card.length - 1; index >= 0; index--) {
    let digit = parseInt(card.charAt(index));
    if (isNaN(digit)) continue;

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
};

/**
 * Validates postal code format for selected countries.
 *
 * @param code Postal code value.
 * @param country Country code (`US`, `UK`, or `CA`).
 * @returns `true` when valid for the selected country.
 */
export const isPostalCode = (code: string, country: "US" | "UK" | "CA" = "US"): boolean => {
  const patterns = {
    US: /^\d{5}(-\d{4})?$/,
    UK: /^[A-Z]{1,2}\d[A-Z\d]? \d[A-Z]{2}$/i,
    CA: /^[A-Z]\d[A-Z] \d[A-Z]\d$/i,
  };
  return patterns[country]?.test(code) ?? false;
};

/**
 * Validates date input and ensures it is not before `1900-01-01`.
 *
 * @param date Date input.
 * @returns `true` when valid and above lower-bound date.
 */
export const checkValidDate = (date: string | Date) => {
  const isValidDate = isValid(new Date(date));
  if (!isValidDate) return false;
  const targetDate = new Date("1900-01-01");
  if (isBefore(new Date(date), targetDate)) return false;
  return true;
};
