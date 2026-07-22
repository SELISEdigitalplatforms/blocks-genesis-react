import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { reducer, toast, useToast } from "@/hooks/use-toast";

type AnyToast = { id: string; open?: boolean; title?: string };

describe("use-toast reducer", () => {
  it("ADD_TOAST prepends and enforces the single-toast limit", () => {
    const s1 = reducer(
      { toasts: [] },
      { type: "ADD_TOAST", toast: { id: "1", open: true } as never },
    );
    expect(s1.toasts).toHaveLength(1);
    const s2 = reducer(s1, {
      type: "ADD_TOAST",
      toast: { id: "2", open: true } as never,
    });
    expect(s2.toasts).toHaveLength(1);
    expect((s2.toasts[0] as AnyToast).id).toBe("2");
  });

  it("UPDATE_TOAST merges into the matching toast", () => {
    const s = reducer(
      { toasts: [{ id: "1", open: true, title: "a" } as never] },
      { type: "UPDATE_TOAST", toast: { id: "1", title: "b" } as never },
    );
    expect((s.toasts[0] as AnyToast).title).toBe("b");
  });

  it("DISMISS_TOAST with an id closes that toast", () => {
    const s = reducer(
      { toasts: [{ id: "1", open: true } as never] },
      { type: "DISMISS_TOAST", toastId: "1" },
    );
    expect((s.toasts[0] as AnyToast).open).toBe(false);
  });

  it("DISMISS_TOAST without an id closes every toast", () => {
    const s = reducer(
      {
        toasts: [
          { id: "1", open: true } as never,
          { id: "2", open: true } as never,
        ],
      },
      { type: "DISMISS_TOAST" },
    );
    expect(s.toasts.every((t) => (t as AnyToast).open === false)).toBe(true);
  });

  it("REMOVE_TOAST with an id removes just that toast", () => {
    const s = reducer(
      {
        toasts: [
          { id: "1", open: true } as never,
          { id: "2", open: true } as never,
        ],
      },
      { type: "REMOVE_TOAST", toastId: "1" },
    );
    expect(s.toasts.map((t) => (t as AnyToast).id)).toEqual(["2"]);
  });

  it("REMOVE_TOAST without an id clears all toasts", () => {
    const s = reducer(
      { toasts: [{ id: "1", open: true } as never] },
      { type: "REMOVE_TOAST" },
    );
    expect(s.toasts).toEqual([]);
  });
});

describe("toast() and useToast()", () => {
  it("adds a toast that useToast exposes and can dismiss", () => {
    const { result } = renderHook(() => useToast());
    act(() => {
      result.current.toast({ title: "Hello" });
    });
    expect((result.current.toasts[0] as AnyToast).title).toBe("Hello");
    act(() => {
      result.current.dismiss();
    });
    expect((result.current.toasts[0] as AnyToast).open).toBe(false);
  });

  it("returns update and dismiss handles from toast()", () => {
    const { result } = renderHook(() => useToast());
    let handle: ReturnType<typeof toast> | undefined;
    act(() => {
      handle = result.current.toast({ title: "X" });
    });
    expect(handle?.id).toBeDefined();
    act(() => {
      handle?.update({ id: handle.id, title: "Y" } as never);
    });
    expect((result.current.toasts[0] as AnyToast).title).toBe("Y");
  });

  it("removes a dismissed toast after the remove delay", () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useToast());
    act(() => {
      result.current.toast({ title: "Bye" });
    });
    const id = (result.current.toasts[0] as AnyToast).id;
    act(() => {
      result.current.dismiss(id);
    });
    expect((result.current.toasts[0] as AnyToast).open).toBe(false);
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.toasts).toHaveLength(0);
    vi.useRealTimers();
  });
});
