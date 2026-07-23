import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useLanguage, type LanguageStorage } from "./use-language";

const makeStorage = (initial: Record<string, string> = {}): LanguageStorage => {
  const map = new Map(Object.entries(initial));
  return {
    get: (key) => map.get(key) ?? null,
    set: (key, value) => {
      map.set(key, value);
    },
  };
};

describe("useLanguage", () => {
  it("falls back to the default language when storage is empty", () => {
    const { result } = renderHook(() =>
      useLanguage({ storage: makeStorage() }),
    );

    expect(result.current.language).toBe("en");
  });

  it("reads the persisted language from storage", () => {
    const { result } = renderHook(() =>
      useLanguage({ storage: makeStorage({ language: "fr" }) }),
    );

    expect(result.current.language).toBe("fr");
  });

  it("persists and reports language changes", () => {
    const storage = makeStorage();
    const onLanguageChange = vi.fn();
    const { result } = renderHook(() =>
      useLanguage({ storage, onLanguageChange }),
    );

    act(() => result.current.setLanguage("de"));

    expect(result.current.language).toBe("de");
    expect(storage.get("language")).toBe("de");
    expect(onLanguageChange).toHaveBeenCalledWith("de");
  });

  it("exposes changeLanguage as an alias of setLanguage", () => {
    const storage = makeStorage();
    const { result } = renderHook(() => useLanguage({ storage }));

    act(() => result.current.changeLanguage("es"));

    expect(result.current.language).toBe("es");
  });

  it("honors a custom storage key", () => {
    const storage = makeStorage({ locale: "it" });

    const { result } = renderHook(() =>
      useLanguage({ storage, storageKey: "locale" }),
    );

    expect(result.current.language).toBe("it");
  });
});
