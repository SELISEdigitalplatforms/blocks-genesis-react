import { useEffect, useRef, useState, type RefObject } from "react";

/**
 * @hook Hook to get the width of a popover element.
 * @returns The popover width.
 * @example
 * const [buttonRef, popoverWidth] = usePopoverWidth()
 * return (
 *   <button ref={buttonRef}>
 *     {popoverWidth}
 *   </button>
 * )
 */
export function usePopoverWidth(): [RefObject<HTMLButtonElement | null>, number | undefined] {
  const [popoverWidth, setPopoverWidth] = useState<number | undefined>(undefined);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const updateWidth = () => {
      if (buttonRef.current) {
        setPopoverWidth(buttonRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  return [buttonRef, popoverWidth];
}
