import { useCallback, useEffect, useState } from "react";

/**
 * Configuration options for `useCountdown`.
 */
export type UseCountdownOptions = {
  /** Starts the timer immediately when `true`. Defaults to `true`. */
  autoStart?: boolean;
  /** Tick interval in milliseconds. Defaults to `1000`. */
  intervalMs?: number;
  /** Called once when countdown reaches zero. */
  onComplete?: () => void;
};

/**
 * Runs a countdown timer with start/pause/reset controls.
 *
 * @param initialSeconds Initial duration in seconds.
 * @param options Countdown behavior options.
 * @returns Countdown state and control actions.
 */
export const useCountdown = (
  initialSeconds: number,
  options: UseCountdownOptions = {},
) => {
  const { autoStart = true, intervalMs = 1000, onComplete } = options;
  const [remainingTime, setRemainingTime] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(autoStart);

  useEffect(() => {
    if (!isRunning) return;
    if (remainingTime <= 0) {
      setIsRunning(false);
      onComplete?.();
      return;
    }

    const interval = setInterval(() => {
      setRemainingTime((previous) => Math.max(previous - 1, 0));
    }, intervalMs);

    return () => clearInterval(interval);
  }, [intervalMs, isRunning, onComplete, remainingTime]);

  const start = useCallback(() => setIsRunning(true), []);
  const pause = useCallback(() => setIsRunning(false), []);
  const reset = useCallback(
    (seconds?: number) => {
      setRemainingTime(seconds ?? initialSeconds);
      setIsRunning(autoStart);
    },
    [autoStart, initialSeconds],
  );

  return {
    remainingTime,
    isRunning,
    start,
    pause,
    reset,
  };
};

/**
 * Backward-compatible alias for `useCountdown`.
 */
export const useCountDown = useCountdown;
