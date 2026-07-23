import { describe, it, expect, beforeEach } from "vitest";
import { createStorage } from "@/utils/storage/create-storage";

describe("createStorage", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it("round-trips a typed value", () => {
    const store = createStorage();
    store.set("k", { a: 1 });
    expect(store.get("k")).toEqual({ a: 1 });
  });

  it("returns null for missing or invalid values", () => {
    const store = createStorage();
    expect(store.get("missing")).toBeNull();
    localStorage.setItem("bad", "{not json");
    expect(store.get("bad")).toBeNull();
  });

  it("keeps values within their TTL and expires them afterwards", () => {
    const live = createStorage("local", { ttlMs: 10000 });
    live.set("k", "v");
    expect(live.get("k")).toBe("v");

    const store = createStorage("local", { ttlMs: 1000 });
    store.set("expired", "v", -1000);
    expect(store.get("expired")).toBeNull();
  });

  it("prefixes keys and clears only prefixed ones", () => {
    const store = createStorage("local", { prefix: "app" });
    store.set("k", "v");
    expect(localStorage.getItem("app:k")).not.toBeNull();
    localStorage.setItem("other", "x");
    store.clear();
    expect(localStorage.getItem("app:k")).toBeNull();
    expect(localStorage.getItem("other")).toBe("x");
  });

  it("clears everything when no prefix is configured", () => {
    const store = createStorage();
    store.set("k", "v");
    localStorage.setItem("other", "x");
    store.clear();
    expect(localStorage.length).toBe(0);
  });

  it("deletes a key", () => {
    const store = createStorage();
    store.set("k", "v");
    store.delete("k");
    expect(store.get("k")).toBeNull();
  });

  it("supports the session driver", () => {
    const store = createStorage("session");
    store.set("k", "v");
    expect(store.get("k")).toBe("v");
    expect(sessionStorage.getItem("k")).not.toBeNull();
  });
});
