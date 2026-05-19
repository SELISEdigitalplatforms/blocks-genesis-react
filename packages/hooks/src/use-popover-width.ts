import { useEffect, useRef, useState, type RefObject } from "react";

/**
 * Measures a trigger button width for popover alignment.
 *
 * @returns Button ref and current width in pixels.
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
