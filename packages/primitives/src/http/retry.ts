import { sleep } from "../utils/misc";

export interface RetryOptions {
  retries: number;
  delay: number;
  factor?: number;
  jitter?: boolean;
}

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
