import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// jsdom does not implement these browser APIs that many components (and the
// theme-aware stores) rely on. Provide inert polyfills so imports and renders
// do not crash. Individual tests can override matchMedia when they assert on it.
if (!window.matchMedia) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

class IntersectionObserverStub {
  readonly root = null;
  readonly rootMargin = "";
  readonly thresholds = [];
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}

globalThis.ResizeObserver ??= ResizeObserverStub as unknown as typeof ResizeObserver;
globalThis.IntersectionObserver ??=
  IntersectionObserverStub as unknown as typeof IntersectionObserver;

if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}

// The app reads runtime configuration from window.__BLOCKS_ENV__ first (see
// src/lib/runtime-env.ts). Provide benign test values so modules that resolve
// service base URLs at import time do not throw when import.meta.env is absent.
if (!(window as unknown as { __BLOCKS_ENV__?: unknown }).__BLOCKS_ENV__) {
  (window as unknown as { __BLOCKS_ENV__: Record<string, string> }).__BLOCKS_ENV__ =
    new Proxy(
      {},
      {
        get: (_target, prop) =>
          typeof prop === "string" ? "https://test.local" : undefined,
        has: () => true,
      },
    ) as Record<string, string>;
}

if (!Element.prototype.hasPointerCapture) {
  Element.prototype.hasPointerCapture = () => false;
  Element.prototype.setPointerCapture = () => {};
  Element.prototype.releasePointerCapture = () => {};
}

afterEach(() => {
  cleanup();
});
