/**
 * Group an array by a key function.
 * @param array - The array to group.
 * @param keyFn - The key function to use to group the array.
 * @returns The grouped array.
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
 * Get unique values from an array by a key function.
 * @param array - The array to get unique values from.
 * @param keyFn - The key function to use to get unique values.
 * @returns The unique values.
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
