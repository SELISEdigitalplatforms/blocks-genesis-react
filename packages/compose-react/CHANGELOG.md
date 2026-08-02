# @seliseblocks/genesis-os

## 4.0.4

### Patch changes

- added forwarded path for each app, so that they can switch to their own designated path.

## 4.0.3

### Patch Changes

- Refactored the login functionality

## 4.0.2

### Patch Changes

- added filtering in app-switcher

## 4.0.0

- Upgraded to react v19.0.0 and react-dom

### Major Changes

- Renamed the package from `@seliseblocks/blocks-kit` to `@seliseblocks/genesis-os`. Update the dependency name and all import paths; no exported API changed.
- Require React 19.2.8 or newer. Support for React 18 is dropped, as is React 19.0.0 through 19.2.7: the `react`, `react-dom`, and `@types/react` peer ranges are now `^19.2.8`.
- Switched the router peer from `react-router-dom@^7` to `react-router@^8`. `react-router-dom` is frozen at 7.18.1 and never received a v8, and every 7.x release is affected by GHSA-qwww-vcr4-c8h2 (RSC-mode CSRF bypass, high), which is only patched in `react-router@8.3.0`. Host applications must install `react-router@^8` and change their own `react-router-dom` imports to `react-router`; the exported symbols are unchanged.
- Raised the `nuqs` peer floor to `^2.9.0`. Earlier 2.x releases declare no `react-router@8` support and ship no `nuqs/adapters/react-router/v8` entry point. Applications wiring up nuqs should import `NuqsAdapter` from `nuqs/adapters/react-router/v8`.

Releases before 4.0.0 were published under the `@seliseblocks/blocks-kit` name on the `0.0.x` line.

## 0.0.66

### Patch Changes

- fix project store issue after project create
