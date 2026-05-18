import { isObject } from "./guards";

/**
 * Deep merge two objects.
 * @param target - The target object.
 * @param source - The source object.
 * @returns The merged object.
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
 * Deep clone an object.
 * @param val - The object to clone.
 * @returns The cloned object.
 */
export function deepClone<T>(val: T): T {
  if (typeof structuredClone !== "undefined") return structuredClone(val);
  return JSON.parse(JSON.stringify(val));
}
/**
 * Pick properties from an object.
 * @param obj - The object to pick properties from.
 * @param keys - The keys to pick.
 * @returns The object with picked properties.
 */
export function pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>;
  keys.forEach((key) => {
    if (key in obj) result[key] = obj[key];
  });
  return result;
}
/**
 * Omit properties from an object.
 * @param obj - The object to omit properties from.
 * @param keys - The keys to omit.
 * @returns The object with omitted properties.
 */
export function omit<T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const result = { ...obj };
  keys.forEach((key) => {
    delete result[key];
  });
  return result as Omit<T, K>;
}
