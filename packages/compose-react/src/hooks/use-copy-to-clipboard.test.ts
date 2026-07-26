import { describe, it, expect, vi, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";

const setClipboard = (impl?: { writeText: (t: string) => Promise<void> }) =>
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: impl,
  });

describe("useCopyToClipboard", () => {
  afterEach(() => setClipboard(undefined));

  it("copies text via the clipboard API", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    setClipboard({ writeText });
    const onSuccess = vi.fn();
    const { result } = renderHook(() => useCopyToClipboard());
    let ok: boolean | undefined;
    await act(async () => {
      ok = await result.current.copy("hello", { onSuccess });
    });
    expect(ok).toBe(true);
    expect(writeText).toHaveBeenCalledWith("hello");
    expect(onSuccess).toHaveBeenCalled();
    expect(result.current.copiedText).toBe("hello");
  });

  it("returns false when the clipboard API is unavailable", async () => {
    setClipboard(undefined);
    const onError = vi.fn();
    const { result } = renderHook(() => useCopyToClipboard());
    let ok: boolean | undefined;
    await act(async () => {
      ok = await result.current.copy("x", { onError });
    });
    expect(ok).toBe(false);
    expect(onError).toHaveBeenCalled();
  });

  it("records the error when writeText rejects", async () => {
    const writeText = vi.fn().mockRejectedValue(new Error("boom"));
    setClipboard({ writeText });
    const { result } = renderHook(() => useCopyToClipboard());
    let ok: boolean | undefined;
    await act(async () => {
      ok = await result.current.copy("x");
    });
    expect(ok).toBe(false);
    expect(result.current.error?.message).toBe("boom");
  });
});
