import { isValid, isBefore } from "date-fns";

/**
 * Validate an email address.
 * @param email - The email address to validate.
 * @returns True if the email address is valid, false otherwise.
 */
export const isEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

/**
 * Check if a string is a valid URL.
 * @param url - The string to check.
 * @returns True if the string is a valid URL, false otherwise.
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
 * Check if a string is a valid UUID.
 * @param uuid - The string to check.
 * @returns True if the string is a valid UUID, false otherwise.
 */
export const isUuid = (uuid: string): boolean => {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uuid);
};

/**
 * Check if a string is a valid phone number.
 * @param phone - The phone number to check.
 * @description Check if a string is a valid phone number in E.164 format.
 * @returns True if the phone number is valid, false otherwise.
 */
export const isPhone = (phone: string): boolean => {
  return /^\+[1-9]\d{1,14}$/.test(phone);
};

/**
 * Check if a string is a valid credit card number.
 * @param card - The credit card number to check.
 * @description Check if a string is a valid credit card number using Luhn algorithm.
 * @returns True if the credit card number is valid, false otherwise.
 */
export const isCreditCard = (card: string): boolean => {
  const nDigits = card.replace(/\D/g, "").length;
  if (nDigits < 13 || nDigits > 19) return false;

  let sum = 0;
  let shouldDouble = false;

  for (let i = card.length - 1; i >= 0; i--) {
    let digit = parseInt(card.charAt(i));
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
 * Check if a string is a valid postal code.
 * @param code - The postal code to check.
 * @param country - The country to check the postal code for.
 * @description Check if a string is a valid postal code for the specified country.
 * @returns True if the postal code is valid, false otherwise.
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
 * Check if a date is valid.
 * @param date - The date to check.
 * @description Check if a date is valid and after 1900-01-01.
 * @returns True if the date is valid, false otherwise.
 */
export const checkValidDate = (date: string | Date) => {
  const isValidDate = isValid(new Date(date));
  if (!isValidDate) return false;
  const targetDate = new Date("1900-01-01");
  if (isBefore(new Date(date), targetDate)) return false;
  return true;
};
