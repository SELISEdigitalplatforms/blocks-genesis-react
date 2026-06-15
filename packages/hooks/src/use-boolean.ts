import { useState } from "react";

/**
 * Manages a boolean state with convenience setters.
 *
 * @param initialValue Initial boolean value. Defaults to `false`.
 * @returns Boolean state, toggler, explicit setters, and raw `setValue`.
 */
export const useBoolean = (initialValue: boolean = false) => {
  const [value, setValue] = useState(initialValue);

  const toggle = () => setValue((previous) => !previous);
  const setTrue = () => setValue(true);
  const setFalse = () => setValue(false);

  return { value, toggle, setTrue, setFalse, setValue };
};
