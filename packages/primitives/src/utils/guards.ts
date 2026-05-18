/**
 * Check if a value is a string.
 * @param val - The value to check.
 * @returns True if the value is a string, false otherwise.
 */
export const isString = (val: unknown): val is string => typeof val === "string";
/**
 * Check if a value is a number.
 * @param val - The value to check.
 * @returns True if the value is a number, false otherwise.
 */
export const isNumber = (val: unknown): val is number => typeof val === "number" && !isNaN(val);
/**
 * Check if a value is a boolean.
 * @param val - The value to check.
 * @returns True if the value is a boolean, false otherwise.
 */
export const isBoolean = (val: unknown): val is boolean => typeof val === "boolean";
/**
 * Check if a value is null or undefined.
 * @param val - The value to check.
 * @returns True if the value is null or undefined, false otherwise.
 */
export const isNullish = (val: unknown): val is null | undefined =>
  val === null || val === undefined;
/**
 * Check if a value is an object.
 * @param val - The value to check.
 * @returns True if the value is an object, false otherwise.
 */
export const isObject = (val: unknown): val is Record<string, unknown> =>
  val !== null && typeof val === "object" && !Array.isArray(val);
/**
 * Check if a value is a plain object.
 * @param val - The value to check.
 * @returns True if the value is a plain object, false otherwise.
 */
export const isPlainObject = (val: unknown): val is Record<string, unknown> => {
  if (!isObject(val)) return false;
  const proto = Object.getPrototypeOf(val);
  return proto === null || proto === Object.prototype;
};
/**
 * Check if a value is a promise.
 * @param val - The value to check.
 * @returns True if the value is a promise, false otherwise.
 */
export const isPromise = <T = unknown>(val: unknown): val is Promise<T> =>
  isObject(val) && typeof val.then === "function" && typeof val.catch === "function";
