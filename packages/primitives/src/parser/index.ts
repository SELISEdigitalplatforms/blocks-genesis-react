/**
 * Parse a date string into a Date object.
 * @param dateString - The date string to parse.
 * @returns The parsed Date object.
 * @example
 * parseDateString("2023-01-01"); // Date(2023, 0, 1)
 */
export function parseDateString(dateString: string): Date {
  return new Date(dateString);
}

/**
 * Parse a MongoDB string into a JavaScript object.
 * @param text - The MongoDB string to parse.
 * @returns The parsed JavaScript object.
 * @example
 * parseMongoDBString("ISODate(\"2023-01-01\")"); // Date(2023, 0, 1)
 */
export const parseMongoDBString = (text: string) => {
  return text
    .replace(/(?:ISODate|ObjectId)\("([^"]+)"\)/g, '"$1"')
    .replace(/\{\s*"\$date"\s*:\s*"([^"]+)"\s*\}/g, '"$1"')
    .replace(/NumberLong\((\d+)\)/g, "$1");
};
