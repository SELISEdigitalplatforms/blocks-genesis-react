import * as React from "react";

/**
 * @hook useIsMobile
 * @description - This hook checks if the current device is mobile by using a breakpoint.
 * @param {number} breakPoint - The breakpoint to use for the check. Optional Defaults to 768px.
 * @returns Whether the current device is mobile.
 * @example
 * const isMobile = useIsMobile()
 * return (
 *   <div>
 *     {isMobile ? "Mobile" : "Desktop"}
 *   </div>
 * )
 */
export function useIsMobile(breakPoint: number = 768) {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${breakPoint - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < breakPoint);
    };
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < breakPoint);
    return () => mql.removeEventListener("change", onChange);
  }, [breakPoint]);

  return !!isMobile;
}
