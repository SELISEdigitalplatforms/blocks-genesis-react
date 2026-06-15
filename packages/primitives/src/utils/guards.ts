/**
 * Checks whether a value is a string.
 */
export const isString = (val: unknown): val is string => typeof val === "string";

/**
 * Checks whether a value is a finite number.
 */
export const isNumber = (val: unknown): val is number => typeof val === "number" && !isNaN(val);

/**
 * Checks whether a value is a boolean.
 */
export const isBoolean = (val: unknown): val is boolean => typeof val === "boolean";

/**
 * Checks whether a value is `null` or `undefined`.
 */
export const isNullish = (val: unknown): val is null | undefined =>
  val === null || val === undefined;

/**
 * Checks whether a value is a non-array object.
 */
export const isObject = (val: unknown): val is Record<string, unknown> =>
  val !== null && typeof val === "object" && !Array.isArray(val);

/**
 * Checks whether a value is a plain object (`{}` or `Object.create(null)`).
 */
export const isPlainObject = (val: unknown): val is Record<string, unknown> => {
  if (!isObject(val)) return false;
  const proto = Object.getPrototypeOf(val);
  return proto === null || proto === Object.prototype;
};

/**
 * Checks whether a value is promise-like.
 */
export const isPromise = <T = unknown>(val: unknown): val is Promise<T> =>
  isObject(val) && typeof val.then === "function" && typeof val.catch === "function";
