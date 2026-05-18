import { useState } from "react";

/**
 * Hook to manage a boolean state.
 * @description - This hook manages a boolean state and provides methods to toggle it, set it to true, set it to false, and set it to a specific value.
 * @param {boolean} initialValue - The initial value of the boolean state. Optional Defaults to false.
 * @returns {object} The boolean state and methods to update it.
 * @example
 * const { value, toggle, setTrue, setFalse, setValue } = useBoolean()
 * toggle()
 * setTrue()
 * setFalse()
 * setValue(true)
 * setValue(false)
 * return (
 *   <div>
 *     {value ? "True" : "False"}
 *   </div>
 * )
 */
export const useBoolean = (initialValue: boolean = false) => {
  const [value, setValue] = useState(initialValue);
  const toggle = () => setValue(!value);
  const setTrue = () => setValue(true);
  const setFalse = () => setValue(false);
  return { value, toggle, setTrue, setFalse, setValue };
};
