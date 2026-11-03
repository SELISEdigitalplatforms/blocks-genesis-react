import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useI18nStore } from "./i18n.store";
import { resetLanguages } from "./languages";
import { configureI18n, loadModule, resetI18nRequests } from "./load-module";

const okResponse = (body: unknown) =>
  ({ ok: true, text: () => Promise.resolve(JSON.stringify(body)) }) as Response;

describe("loadModule", () => {
  beforeEach(() => {
    resetI18nRequests();
    resetLanguages();
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
    const fetchMock = vi.fn((url: string) =>
      Promise.resolve(
        url.includes("/api/Language/Gets")
          ? okResponse([
              {
                languageCode: "en-US",
                languageName: "English",
                isDefault: true,
              },
              { languageCode: "xx-XX", languageName: "Test language" },
            ])
          : okResponse({ SIGN_IN: "[xx] Sign in" }),
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    await loadModule("xx", "os.idp");
    await loadModule("xx", "os.idp");

    const fileCalls = fetchMock.mock.calls.filter(([url]) =>
      String(url).includes("GetUilmFile"),
    );
    expect(fileCalls).toHaveLength(1);
    const [url, init] = fileCalls[0] as unknown as [string, RequestInit];
    expect(url).toBe(
      "https://loc.example/api/Key/GetUilmFile?Language=xx-XX&ModuleName=os.idp",
    );
    expect(init.headers).toEqual({ "X-Blocks-Key": "key-1" });
    expect(useI18nStore.getState().remote["xx:os.idp"]).toEqual({
      SIGN_IN: "[xx] Sign in",
    });
    expect(localStorage.getItem("blocks-i18n:xx:os.idp")).toContain(
      "[xx] Sign in",
    );
  });

  it("uses the cache when the service fails", async () => {
    localStorage.setItem(
      "blocks-i18n:xx:os.idp",
      JSON.stringify({ SIGN_IN: "Alt" }),
    );
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("down")));

    await loadModule("xx", "os.idp");

    expect(useI18nStore.getState().remote["xx:os.idp"]).toEqual({
      SIGN_IN: "Alt",
    });
  });

  it("ignores an empty or malformed answer", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(okResponse(["x"])));
    await loadModule("xx", "os.idp");
    expect(useI18nStore.getState().remote["xx:os.idp"]).toBeUndefined();
  });

  it("keeps the text entries when a published value is null", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          okResponse({ SIGN_IN: "[xx] Sign in", BROKEN: null }),
        ),
    );
    await loadModule("xx", "os.idp");
    expect(useI18nStore.getState().remote["xx:os.idp"]).toEqual({
      SIGN_IN: "[xx] Sign in",
    });
  });

  it("does not call the service without base url or key", async () => {
    configureI18n({ baseUrl: () => "", blocksKey: () => "" });
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    await loadModule("xx", "os.idp");
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("loadModule culture", () => {
  beforeEach(() => {
    resetI18nRequests();
    resetLanguages();
    localStorage.clear();
    useI18nStore.setState({ bundled: {}, remote: {} });
    configureI18n({
      baseUrl: () => "https://loc.example",
      blocksKey: () => "key-1",
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("asks for the project's own culture of a language", async () => {
    const fetchMock = vi.fn((url: string) =>
      Promise.resolve(
        url.includes("/api/Language/Gets")
          ? okResponse([
              { languageCode: "en-US", languageName: "English" },
              { languageCode: "fr-CH", languageName: "Français" },
            ])
          : okResponse({ SIGN_IN: "Se connecter" }),
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    await loadModule("fr", "os.idp");

    expect(fetchMock).toHaveBeenCalledWith(
      "https://loc.example/api/Key/GetUilmFile?Language=fr-CH&ModuleName=os.idp",
      expect.anything(),
    );
  });
});
