import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useBoolean } from "@/hooks/use-boolean";

describe("useBoolean", () => {
  it("defaults to false and exposes working setters", () => {
    const { result } = renderHook(() => useBoolean());
    expect(result.current.value).toBe(false);
    act(() => result.current.toggle());
    expect(result.current.value).toBe(true);
    act(() => result.current.setFalse());
    expect(result.current.value).toBe(false);
    act(() => result.current.setTrue());
    expect(result.current.value).toBe(true);
    act(() => result.current.setValue(false));
    expect(result.current.value).toBe(false);
  });

  it("accepts an initial value", () => {
    const { result } = renderHook(() => useBoolean(true));
    expect(result.current.value).toBe(true);
  });
});
