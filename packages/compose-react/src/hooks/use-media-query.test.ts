import { describe, it, expect, vi, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useMediaQuery } from "@/hooks/use-media-query";

const original = window.matchMedia;

describe("useMediaQuery", () => {
  afterEach(() => {
    window.matchMedia = original;
  });

  it("reflects the initial match state", () => {
    window.matchMedia = vi.fn().mockReturnValue({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }) as unknown as typeof window.matchMedia;
    const { result } = renderHook(() => useMediaQuery("(min-width: 768px)"));
    expect(result.current).toBe(true);
  });

  it("updates when the media query change event fires", () => {
    let changeHandler: ((event: { matches: boolean }) => void) | undefined;
    window.matchMedia = vi.fn().mockReturnValue({
      matches: false,
      addEventListener: (
        _: string,
        cb: (event: { matches: boolean }) => void,
      ) => {
        changeHandler = cb;
      },
      removeEventListener: vi.fn(),
    }) as unknown as typeof window.matchMedia;
    const { result } = renderHook(() => useMediaQuery("(min-width: 768px)"));
    expect(result.current).toBe(false);
    act(() => changeHandler?.({ matches: true }));
    expect(result.current).toBe(true);
  });
});
