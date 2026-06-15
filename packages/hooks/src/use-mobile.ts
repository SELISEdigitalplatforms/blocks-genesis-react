import { useMediaQuery } from "./use-media-query";

/**
 * Default breakpoint used by `useIsMobile`.
 */
export const MOBILE_BREAKPOINT = 768;

/**
 * Determines whether the viewport width is below a mobile breakpoint.
 *
 * @param breakpoint Breakpoint in pixels. Defaults to `MOBILE_BREAKPOINT`.
 * @returns `true` for mobile widths; otherwise `false`.
 */
export function useIsMobile(breakpoint = MOBILE_BREAKPOINT): boolean {
  return useMediaQuery(`(max-width: ${breakpoint - 1}px)`);
}
