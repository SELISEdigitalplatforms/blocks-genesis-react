import { useEffect, useState } from "react";
import { debounce } from "@blocks-kit/primitives";

export const useDebouncedValue = <T>(value: T, delayMs: number): T => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const handler = debounce((v: T) => setDebounced(v), delayMs);
    handler(value);
    return () => handler.cancel();
  }, [value, delayMs]);

  return debounced;
};
