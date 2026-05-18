/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Debounce a function.
 * @param fn - The function to debounce.
 * @param delay - The delay in milliseconds to debounce.
 * @returns The debounced function.
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
 * Throttle a function.
 * @param fn - The function to throttle.
 * @param limit - The limit in milliseconds to throttle.
 * @returns The throttled function.
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
 * Memoize a function.
 * @param fn - The function to memoize.
 * @param keyFn - The key function to use to memoize the function.
 * @returns The memoized function.
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
 * Create an event emitter.
 * @param T - The type of the event emitter.
 * @returns The event emitter.
 */
export function createEventEmitter<T extends Record<string, unknown>>() {
  const listeners = new Map<keyof T, Set<(data: unknown) => void>>();

  return {
    /**
     * Add a listener to the event emitter.
     * @param event - The event to listen for.
     * @param listener - The listener function.
     * @returns A function to remove the listener.
     */
    on<K extends keyof T>(event: K, listener: (data: T[K]) => void) {
      if (!listeners.has(event)) listeners.set(event, new Set());
      listeners.get(event)!.add(listener as (data: unknown) => void);
      return () => this.off(event, listener);
    },
    /**
     * Remove a listener from the event emitter.
     * @param event - The event to remove the listener from.
     * @param listener - The listener function.
     */
    off<K extends keyof T>(event: K, listener: (data: T[K]) => void) {
      listeners.get(event)?.delete(listener as (data: unknown) => void);
    },
    /**
     * Emit an event.
     * @param event - The event to emit.
     * @param data - The data to emit.
     */
    emit<K extends keyof T>(event: K, data: T[K]) {
      listeners.get(event)?.forEach((l) => l(data));
    },
  };
}
/**
 * Sleep for a given number of milliseconds.
 * @param ms - The number of milliseconds to sleep.
 * @returns A promise that resolves after the specified number of milliseconds.
 */
export function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}
