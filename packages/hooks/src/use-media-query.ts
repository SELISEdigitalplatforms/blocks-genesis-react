import { useEffect, useState } from "react";

/**
 * Options accepted by `useMediaQuery`.
 */
export type UseMediaQueryOptions = {
  /** SSR fallback value before client hydration. Defaults to `false`. */
  defaultValue?: boolean;
};

/**
 * Tracks whether a CSS media query currently matches.
 *
 * @param query Media query string (for example, `"(min-width: 768px)"`).
 * @param options SSR fallback options.
 * @returns `true` when query matches; otherwise `false`.
 */
export const useMediaQuery = (
  query: string,
  options: UseMediaQueryOptions = {},
): boolean => {
  const { defaultValue = false } = options;

  const getMatches = (): boolean => {
    if (typeof window === "undefined") {
      return defaultValue;
    }
    return window.matchMedia(query).matches;
  };

  const [matches, setMatches] = useState<boolean>(getMatches);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQueryList = window.matchMedia(query);
    const onChange = (event: MediaQueryListEvent) => setMatches(event.matches);

    setMatches(mediaQueryList.matches);
    mediaQueryList.addEventListener("change", onChange);

    return () => mediaQueryList.removeEventListener("change", onChange);
  }, [query]);

  return matches;
};
