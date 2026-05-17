export const isString = (val: unknown): val is string => typeof val === "string";
export const isNumber = (val: unknown): val is number => typeof val === "number" && !isNaN(val);
export const isBoolean = (val: unknown): val is boolean => typeof val === "boolean";
export const isNullish = (val: unknown): val is null | undefined =>
  val === null || val === undefined;
export const isObject = (val: unknown): val is Record<string, unknown> =>
  val !== null && typeof val === "object" && !Array.isArray(val);
export const isPlainObject = (val: unknown): val is Record<string, unknown> => {
  if (!isObject(val)) return false;
  const proto = Object.getPrototypeOf(val);
  return proto === null || proto === Object.prototype;
};
export const isPromise = <T = unknown>(val: unknown): val is Promise<T> =>
  isObject(val) && typeof val.then === "function" && typeof val.catch === "function";
