/**
 * Combine multiple Abort signals into a single Abort signal.
 * @param signals - The Abort signals to combine.
 * @returns A single Abort signal that is aborted when any of the input signals are aborted.
 */
export function anySignal(signals: AbortSignal[]): AbortSignal {
  const controller = new AbortController();
  for (const signal of signals) {
    if (signal.aborted) {
      controller.abort();
      break;
    }
    signal.addEventListener("abort", () => controller.abort(), { once: true });
  }
  return controller.signal;
}
