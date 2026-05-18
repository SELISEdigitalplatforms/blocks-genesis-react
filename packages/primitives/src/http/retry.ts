import { sleep } from "@/utils";

/**
 * Retry options.
 * @param retries - The number of retries to attempt.
 * @param delay - The initial delay between retries.
 * @param factor - The backoff factor to use.
 * @param jitter - Whether to add jitter to the delay.
 */
export interface RetryOptions {
  retries: number;
  delay: number;
  factor?: number;
  jitter?: boolean;
}

/**
 * Create a retry function.
 * @param fn - The function to wrap in retry logic.
 * @param options - The retry options.
 * @returns The retry function.
 */
export async function createRetry<T>(fn: () => Promise<T>, options: RetryOptions): Promise<T> {
  const { retries, delay, factor = 2, jitter = true } = options;
  let lastError: unknown;

  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (i < retries) {
        const backoff = delay * Math.pow(factor, i);
        const wait = jitter ? backoff * (0.5 + Math.random() * 0.5) : backoff;
        await sleep(wait);
      }
    }
  }

  throw lastError;
}
