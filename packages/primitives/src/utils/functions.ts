/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Creates a debounced function with `cancel` support.
 *
 * @typeParam T Function type.
 * @param fn Function to debounce.
 * @param delay Delay in milliseconds.
 * @returns Debounced function with `cancel()` helper.
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number,
): { (...args: Parameters<T>): void; cancel: () => void } {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const debounced = (...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };

  debounced.cancel = () => {
    if (timeoutId) clearTimeout(timeoutId);
  };

  return debounced;
}

/**
 * Creates a throttled function with `cancel` support.
 *
 * @typeParam T Function type.
 * @param fn Function to throttle.
 * @param limit Minimum interval in milliseconds.
 * @returns Throttled function with `cancel()` helper.
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number,
): { (...args: Parameters<T>): void; cancel: () => void } {
  let inThrottle = false;
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const throttled = (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      timeoutId = setTimeout(() => (inThrottle = false), limit);
    }
  };

  throttled.cancel = () => {
    if (timeoutId) clearTimeout(timeoutId);
    inThrottle = false;
  };

  return throttled;
}

/**
 * Memoizes a pure function by key.
 *
 * @typeParam T Function type.
 * @param fn Function to memoize.
 * @param keyFn Optional cache key resolver. Defaults to `JSON.stringify(args)`.
 * @returns Memoized function.
 */
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  keyFn?: (...args: Parameters<T>) => string,
): T {
  const cache = new Map<string, unknown>();
  return ((...args: Parameters<T>) => {
    const key = keyFn ? keyFn(...args) : JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
}

/**
 * Creates a lightweight typed event emitter.
 *
 * @typeParam T Event map where keys are event names and values are payload types.
 * @returns Event emitter with `on`, `off`, and `emit` methods.
 */
export function createEventEmitter<T extends Record<string, unknown>>() {
  const listeners = new Map<keyof T, Set<(data: unknown) => void>>();

  return {
    /**
     * Subscribes to an event.
     */
    on<K extends keyof T>(event: K, listener: (data: T[K]) => void) {
      if (!listeners.has(event)) listeners.set(event, new Set());
      listeners.get(event)!.add(listener as (data: unknown) => void);
      return () => this.off(event, listener);
    },
    /**
     * Unsubscribes an event listener.
     */
    off<K extends keyof T>(event: K, listener: (data: T[K]) => void) {
      listeners.get(event)?.delete(listener as (data: unknown) => void);
    },
    /**
     * Emits an event payload to current listeners.
     */
    emit<K extends keyof T>(event: K, data: T[K]) {
      listeners.get(event)?.forEach((listener) => listener(data));
    },
  };
}

/**
 * Waits for a given duration.
 *
 * @param ms Duration in milliseconds.
 * @returns Promise resolved after the delay.
 */
export function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}
