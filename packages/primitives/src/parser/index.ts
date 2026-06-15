/**
 * Parses a date string into a `Date` object.
 *
 * @param dateString Date string input.
 * @returns Parsed date instance.
 */
export function parseDateString(dateString: string): Date {
  return new Date(dateString);
}

/**
 * Normalizes common Mongo shell wrappers into JSON-friendly primitives.
 *
 * @param text Mongo-style text containing wrappers like `ISODate(...)`.
 * @returns Normalized string suitable for further parsing.
 */
export const parseMongoDBString = (text: string) => {
  return text
    .replace(/(?:ISODate|ObjectId)\("([^"]+)"\)/g, '"$1"')
    .replace(/\{\s*"\$date"\s*:\s*"([^"]+)"\s*\}/g, '"$1"')
    .replace(/NumberLong\((\d+)\)/g, "$1");
};
