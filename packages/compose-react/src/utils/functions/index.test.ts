import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  debounce,
  throttle,
  memoize,
  createEventEmitter,
  sleep,
} from "@/utils/functions";

describe("debounce", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("invokes the function once after the delay elapses", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);
    debounced();
    debounced();
    debounced();
    expect(fn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("passes the most recent arguments", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 50);
    debounced("a");
    debounced("b");
    vi.advanceTimersByTime(50);
    expect(fn).toHaveBeenCalledWith("b");
  });

  it("cancel prevents a pending invocation", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 50);
    debounced();
    debounced.cancel();
    vi.advanceTimersByTime(50);
    expect(fn).not.toHaveBeenCalled();
  });
});

describe("throttle", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("invokes immediately then blocks until the limit elapses", () => {
    const fn = vi.fn();
    const throttled = throttle(fn, 100);
    throttled();
    throttled();
    expect(fn).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(100);
    throttled();
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("cancel resets the throttle gate", () => {
    const fn = vi.fn();
    const throttled = throttle(fn, 100);
    throttled();
    throttled.cancel();
    throttled();
    expect(fn).toHaveBeenCalledTimes(2);
  });
});

describe("memoize", () => {
  it("caches results keyed by serialized arguments", () => {
    const fn = vi.fn((a: number, b: number) => a + b);
    const memoized = memoize(fn);
    expect(memoized(1, 2)).toBe(3);
    expect(memoized(1, 2)).toBe(3);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("recomputes for different arguments", () => {
    const fn = vi.fn((a: number) => a * 2);
    const memoized = memoize(fn);
    memoized(2);
    memoized(3);
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("uses a custom key resolver when provided", () => {
    const fn = vi.fn((obj: { id: number }) => obj.id);
    const memoized = memoize(fn, (obj) => String(obj.id));
    memoized({ id: 1 });
    memoized({ id: 1 });
    expect(fn).toHaveBeenCalledTimes(1);
  });
});

describe("createEventEmitter", () => {
  it("delivers emitted payloads to subscribers", () => {
    const emitter = createEventEmitter<{ ping: number }>();
    const listener = vi.fn();
    emitter.on("ping", listener);
    emitter.emit("ping", 42);
    expect(listener).toHaveBeenCalledWith(42);
  });

  it("stops delivering after off", () => {
    const emitter = createEventEmitter<{ ping: number }>();
    const listener = vi.fn();
    emitter.on("ping", listener);
    emitter.off("ping", listener);
    emitter.emit("ping", 1);
    expect(listener).not.toHaveBeenCalled();
  });

  it("returns an unsubscribe handle from on", () => {
    const emitter = createEventEmitter<{ ping: number }>();
    const listener = vi.fn();
    const unsubscribe = emitter.on("ping", listener);
    unsubscribe();
    emitter.emit("ping", 1);
    expect(listener).not.toHaveBeenCalled();
  });

  it("ignores emit for events with no listeners", () => {
    const emitter = createEventEmitter<{ ping: number }>();
    expect(() => emitter.emit("ping", 1)).not.toThrow();
  });
});

describe("sleep", () => {
  it("resolves after the given duration", async () => {
    vi.useFakeTimers();
    const spy = vi.fn();
    sleep(100).then(spy);
    await vi.advanceTimersByTimeAsync(100);
    expect(spy).toHaveBeenCalled();
    vi.useRealTimers();
  });
});
