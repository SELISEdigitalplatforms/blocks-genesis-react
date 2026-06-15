import { isObject } from "./guards";

/**
 * Deep-merges two objects recursively.
 *
 * @typeParam T Target object type.
 * @param target Target object.
 * @param source Source object.
 * @returns Deep-merged object.
 */
export function deepMerge<T extends Record<string, unknown>>(target: T, source: unknown): T {
  const output = { ...target };
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach((key) => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          output[key as keyof T] = deepMerge(
            target[key] as Record<string, unknown>,
            source[key],
          ) as T[keyof T];
        }
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  return output;
}

/**
 * Deep-clones a value.
 *
 * Uses `structuredClone` when available, otherwise JSON serialization fallback.
 *
 * @typeParam T Value type.
 * @param val Value to clone.
 * @returns Deep-cloned value.
 */
export function deepClone<T>(val: T): T {
  if (typeof structuredClone !== "undefined") return structuredClone(val);
  return JSON.parse(JSON.stringify(val));
}

/**
 * Picks selected keys from an object.
 *
 * @typeParam T Source object type.
 * @typeParam K Selected key type.
 * @param obj Source object.
 * @param keys Keys to include.
 * @returns Object with selected keys only.
 */
export function pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>;
  keys.forEach((key) => {
    if (key in obj) result[key] = obj[key];
  });
  return result;
}

/**
 * Omits selected keys from an object.
 *
 * @typeParam T Source object type.
 * @typeParam K Omitted key type.
 * @param obj Source object.
 * @param keys Keys to remove.
 * @returns Object without omitted keys.
 */
export function omit<T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const result = { ...obj };
  keys.forEach((key) => {
    delete result[key];
  });
  return result as Omit<T, K>;
}
