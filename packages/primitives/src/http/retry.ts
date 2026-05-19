import { sleep } from "../utils/functions";

/**
 * Retry configuration used by `createRetry`.
 */
export interface RetryOptions {
  /** Retry count (excluding the first attempt). */
  retries: number;
  /** Base delay in milliseconds before retry. */
  delay: number;
  /** Exponential backoff multiplier. Defaults to `2`. */
  factor?: number;
  /** Adds random jitter when `true`. Defaults to `true`. */
  jitter?: boolean;
}

/**
 * Retries an async function using exponential backoff.
 *
 * @typeParam T Success value type.
 * @param fn Async function to execute.
 * @param options Retry options.
 * @returns First successful result.
 * @throws Last error after retries are exhausted.
 */
export async function createRetry<T>(fn: () => Promise<T>, options: RetryOptions): Promise<T> {
  const { retries, delay, factor = 2, jitter = true } = options;
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt < retries) {
        const baseBackoff = delay * Math.pow(factor, attempt);
        const waitTime = jitter ? baseBackoff * (0.5 + Math.random() * 0.5) : baseBackoff;
        await sleep(waitTime);
      }
    }
  }

  throw lastError;
}
