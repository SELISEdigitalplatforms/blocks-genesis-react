import { isValid, isBefore } from "date-fns";

export const isEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const isUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const isUuid = (uuid: string): boolean => {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uuid);
};

export const isPhone = (phone: string): boolean => {
  // E.164 format
  return /^\+[1-9]\d{1,14}$/.test(phone);
};

export const isCreditCard = (card: string): boolean => {
  // Luhn algorithm
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

export const isPostalCode = (code: string, country: "US" | "UK" | "CA" = "US"): boolean => {
  const patterns = {
    US: /^\d{5}(-\d{4})?$/,
    UK: /^[A-Z]{1,2}\d[A-Z\d]? \d[A-Z]{2}$/i,
    CA: /^[A-Z]\d[A-Z] \d[A-Z]\d$/i,
  };
  return patterns[country]?.test(code) ?? false;
};

export const checkValidDate = (date: string | Date) => {
  const isValidDate = isValid(new Date(date));
  if (!isValidDate) return false;
  const targetDate = new Date("1900-01-01");
  if (isBefore(new Date(date), targetDate)) return false;
  return true;
};
