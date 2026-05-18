import { useEffect, useState } from "react";
import { debounce } from "@blocks-kit/primitives";

/**
 * @hook useDebouncedValue
 * @description - Debounce a value for a specified delay.
 * @param {T} value - The value to debounce.
 * @param {number} delayMs - The delay in milliseconds.
 * @returns {T} The debounced value.
 */
export const useDebouncedValue = <T>(value: T, delayMs: number): T => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const handler = debounce((v: T) => setDebounced(v), delayMs);
    handler(value);
    return () => handler.cancel();
  }, [value, delayMs]);

  return debounced;
};
