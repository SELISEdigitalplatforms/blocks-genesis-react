import { describe, it, expect } from "vitest";
import { CookieStorage } from "@/lib/cookie-storage";

describe("CookieStorage", () => {
  const storage = new CookieStorage();

  it("returns an empty string for a missing cookie", () => {
    expect(storage.getItem("cs-missing")).toBe("");
  });

  it("round-trips a simple value", () => {
    storage.setItem("cs-simple", "hello");
    expect(storage.getItem("cs-simple")).toBe("hello");
  });

  it("encodes and decodes values with special characters", () => {
    storage.setItem("cs-special", "a b&c=d");
    expect(storage.getItem("cs-special")).toBe("a b&c=d");
  });

  it("serializes boolean and value options without throwing", () => {
    expect(() =>
      storage.setItem("cs-opts", "v", {
        secure: true,
        sameSite: "Lax",
        path: "/",
        expires: 3600,
      }),
    ).not.toThrow();
  });

  it("omits boolean options whose value is false", () => {
    storage.setItem("cs-nosecure", "v", { secure: false });
    expect(storage.getItem("cs-nosecure")).toBe("v");
  });

  it("removeItem is a no-op for a missing cookie", () => {
    expect(() => storage.removeItem("cs-absent")).not.toThrow();
  });

  it("removeItem processes an existing cookie without throwing", () => {
    storage.setItem("cs-del", "v");
    expect(() => storage.removeItem("cs-del")).not.toThrow();
  });
});
