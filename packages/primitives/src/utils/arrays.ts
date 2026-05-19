/**
 * Groups array items by a computed key.
 *
 * @typeParam T Item type.
 * @typeParam K Group key type.
 * @param array Source array.
 * @param keyFn Key selector function.
 * @returns Record keyed by group values.
 */
export function groupBy<T, K extends string | number | symbol>(
  array: T[],
  keyFn: (item: T) => K,
): Record<K, T[]> {
  return array.reduce(
    (acc, item) => {
      const key = keyFn(item);
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    },
    {} as Record<K, T[]>,
  );
}

/**
 * Returns unique array items by a computed key.
 *
 * @typeParam T Item type.
 * @typeParam K Key type used for uniqueness.
 * @param array Source array.
 * @param keyFn Key selector function.
 * @returns De-duplicated array preserving first occurrences.
 */
export function uniqueBy<T, K>(array: T[], keyFn: (item: T) => K): T[] {
  const seen = new Set<K>();
  return array.filter((item) => {
    const key = keyFn(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
