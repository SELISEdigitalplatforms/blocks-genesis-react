/**
 * Test double substituted for imported binary/vector asset modules (svg, png,
 * jpg, ...) via the resolve alias in `vitest.config.ts`. Vitest cannot parse
 * real asset files as modules, so components and constants that import icons or
 * images resolve to this stub during unit tests.
 */

/** Stand-in React component for svgr-style `ReactComponent` named imports. */
export const ReactComponent = (): null => null;

/** Stand-in URL string for default asset imports (`import icon from "x.svg"`). */
export default "asset-stub";
