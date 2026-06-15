import { useMemo } from "react";

/**
 * Breadcrumb-like segment representation derived from a pathname.
 */
export type PathSegment = {
  /** Segment URL up to current index (for example, `/projects/123`). */
  href: string;
  /** Human-friendly label produced by the formatter. */
  label: string;
  /** Raw segment text from the pathname. */
  segment: string;
  /** Zero-based segment index. */
  index: number;
};

/**
 * Options for `getPathSegments` and `usePathSegments`.
 */
export type UsePathSegmentsOptions = {
  /** Custom label formatter for each raw segment. */
  formatter?: (segment: string) => string;
};

/**
 * Default segment label formatter.
 *
 * Converts kebab-case path parts to title case labels.
 *
 * @param segment Raw path segment.
 * @returns Human-friendly label.
 */
export const defaultPathSegmentFormatter = (segment: string): string =>
  segment
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

/**
 * Parses a pathname into breadcrumb-like segments.
 *
 * @param pathname Source pathname.
 * @param options Label formatting options.
 * @returns Ordered list of path segments.
 */
export const getPathSegments = (
  pathname: string,
  options: UsePathSegmentsOptions = {},
): PathSegment[] => {
  const { formatter = defaultPathSegmentFormatter } = options;
  const pathArray = pathname.split("/").filter(Boolean);

  return pathArray.map((segment, index) => ({
    href: `/${pathArray.slice(0, index + 1).join("/")}`,
    label: formatter(segment),
    segment,
    index,
  }));
};

/**
 * Memoized hook wrapper for `getPathSegments`.
 *
 * @param pathname Source pathname.
 * @param options Label formatting options.
 * @returns Memoized list of path segments.
 */
export const usePathSegments = (
  pathname: string,
  options: UsePathSegmentsOptions = {},
): PathSegment[] => {
  return useMemo(() => getPathSegments(pathname, options), [options, pathname]);
};
