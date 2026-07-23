import { describe, it, expect } from "vitest";
import { createCookieStore } from "@/utils/storage/cookie";

describe("createCookieStore", () => {
  const store = createCookieStore();

  it("round-trips an encoded value", () => {
    store.set("ck", "hello world");
    expect(store.get("ck")).toBe("hello world");
  });

  it("returns null for a missing cookie", () => {
    expect(store.get("ck-does-not-exist")).toBeNull();
  });

  it("writes option attributes without throwing", () => {
    expect(() =>
      store.set("ck2", "v", {
        path: "/",
        domain: "example.com",
        sameSite: "Strict",
        secure: true,
        maxAge: 60,
        expires: new Date(Date.now() + 1000),
      }),
    ).not.toThrow();
  });

  it("delete writes an expired cookie without throwing", () => {
    expect(() => store.delete("ck")).not.toThrow();
  });

  it("falls back to the raw value when decoding fails", () => {
    document.cookie = "badcookie=%E0%A4%A";
    expect(store.get("badcookie")).toBe("%E0%A4%A");
  });

  it("supports a custom encoder and decoder", () => {
    const custom = createCookieStore({
      encode: (v) => `X${v}`,
      decode: (v) => v.slice(1),
    });
    custom.set("ckcustom", "hi");
    expect(custom.get("ckcustom")).toBe("hi");
  });
});
