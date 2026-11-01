import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useI18nStore } from "./i18n.store";
import { configureI18n, loadModule, resetI18nRequests } from "./load-module";

const okResponse = (body: unknown) =>
  ({ ok: true, text: () => Promise.resolve(JSON.stringify(body)) }) as Response;

describe("loadModule", () => {
  beforeEach(() => {
    resetI18nRequests();
    localStorage.clear();
    useI18nStore.setState({ bundled: {}, remote: {} });
    configureI18n({
      baseUrl: () => "https://loc.example/",
      blocksKey: () => "key-1",
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("never fetches English", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    await loadModule("en", "os.idp");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("fetches the published file once and caches it", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(okResponse({ SIGN_IN: "Anmelden" }));
    vi.stubGlobal("fetch", fetchMock);

    await loadModule("de", "os.idp");
    await loadModule("de", "os.idp");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(
      "https://loc.example/api/Key/GetUilmFile?Language=de-DE&ModuleName=os.idp",
    );
    expect(init.headers).toEqual({ "X-Blocks-Key": "key-1" });
    expect(useI18nStore.getState().remote["de:os.idp"]).toEqual({
      SIGN_IN: "Anmelden",
    });
    expect(localStorage.getItem("blocks-i18n:de:os.idp")).toContain("Anmelden");
  });

  it("uses the cache when the service fails", async () => {
    localStorage.setItem(
      "blocks-i18n:de:os.idp",
      JSON.stringify({ SIGN_IN: "Alt" }),
    );
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("down")));

    await loadModule("de", "os.idp");

    expect(useI18nStore.getState().remote["de:os.idp"]).toEqual({
      SIGN_IN: "Alt",
    });
  });

  it("ignores an empty or malformed answer", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(okResponse(["x"])));
    await loadModule("de", "os.idp");
    expect(useI18nStore.getState().remote["de:os.idp"]).toBeUndefined();
  });

  it("does not call the service without base url or key", async () => {
    configureI18n({ baseUrl: () => "", blocksKey: () => "" });
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    await loadModule("de", "os.idp");
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
