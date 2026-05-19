import { useEffect, useState } from "react";
import { debounce } from "@blocks-kit/primitives";

/**
 * Returns a debounced version of a value.
 *
 * @typeParam T Value type.
 * @param value Source value.
 * @param delayMs Debounce duration in milliseconds.
 * @returns Debounced value.
 */
export const useDebouncedValue = <T>(value: T, delayMs: number): T => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const handler = debounce((nextValue: T) => setDebounced(nextValue), delayMs);
    handler(value);
    return () => handler.cancel();
  }, [value, delayMs]);

  return debounced;
};
