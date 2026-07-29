import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createRef } from "react";
import { useAtmosphericCanvas } from "./use-atmospheric-canvas";

const rafHandles: number[] = [];
const cancelled: number[] = [];

const makeFakeCtx = () =>
  ({
    setTransform: vi.fn(),
    clearRect: vi.fn(),
    createRadialGradient: vi.fn(() => ({
      addColorStop: vi.fn(),
    })),
    fillRect: vi.fn(),
    fillStyle: "",
  }) as unknown as CanvasRenderingContext2D;

const makeFakeCanvas = () =>
  ({
    width: 0,
    height: 0,
    style: {},
    getContext: vi.fn(() => makeFakeCtx()),
  }) as unknown as HTMLCanvasElement;

beforeEach(() => {
  rafHandles.length = 0;
  cancelled.length = 0;
  // Only execute the very first callback once so the draw() recursion does
  // not blow the stack under jsdom. Subsequent frame callbacks are recorded
  // but not invoked — we only care about scheduling/cancellation here.
  let firstCbInvoked = false;
  vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
    const handle = rafHandles.length + 1;
    rafHandles.push(handle);
    if (!firstCbInvoked) {
      firstCbInvoked = true;
      cb(0);
    }
    return handle;
  });
  vi.spyOn(window, "cancelAnimationFrame").mockImplementation((handle) => {
    cancelled.push(handle);
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("useAtmosphericCanvas", () => {
  it("schedules animation frames while the canvas is mounted", () => {
    const ref = createRef<HTMLCanvasElement>();
    ref.current = makeFakeCanvas();

    renderHook(() => useAtmosphericCanvas(ref));

    expect(rafHandles.length).toBeGreaterThan(0);
  });

  it("does nothing when the ref points to no canvas", () => {
    const ref = createRef<HTMLCanvasElement>();

    renderHook(() => useAtmosphericCanvas(ref));

    expect(rafHandles.length).toBe(0);
    expect(window.requestAnimationFrame).not.toHaveBeenCalled();
  });

  it("does nothing when getContext returns null", () => {
    const ref = createRef<HTMLCanvasElement>();
    ref.current = {
      width: 0,
      height: 0,
      style: {},
      getContext: vi.fn(() => null),
    } as unknown as HTMLCanvasElement;

    renderHook(() => useAtmosphericCanvas(ref));

    expect(window.requestAnimationFrame).not.toHaveBeenCalled();
  });

  it("cancels pending animation frames on unmount", () => {
    const ref = createRef<HTMLCanvasElement>();
    ref.current = makeFakeCanvas();

    const { unmount } = renderHook(() => useAtmosphericCanvas(ref));
    const scheduled = rafHandles.length;
    expect(scheduled).toBeGreaterThan(0);

    unmount();

    expect(cancelled).toEqual(
      expect.arrayContaining(rafHandles.slice(0, scheduled)),
    );
  });
});
