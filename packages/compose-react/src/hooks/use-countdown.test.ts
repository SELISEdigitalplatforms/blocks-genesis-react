import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useCountDown } from "@/hooks/use-countdown";

describe("useCountDown", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("counts down and calls onComplete at zero", () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() => useCountDown(2, { onComplete }));
    expect(result.current.remainingTime).toBe(2);
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.remainingTime).toBe(1);
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.remainingTime).toBe(0);
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(result.current.isRunning).toBe(false);
  });

  it("supports start, pause and reset", () => {
    const { result } = renderHook(() => useCountDown(5, { autoStart: false }));
    expect(result.current.isRunning).toBe(false);
    act(() => result.current.start());
    expect(result.current.isRunning).toBe(true);
    act(() => result.current.pause());
    expect(result.current.isRunning).toBe(false);
    act(() => result.current.reset(10));
    expect(result.current.remainingTime).toBe(10);
  });
});
