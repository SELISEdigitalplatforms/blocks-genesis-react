import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { configureI18n } from "./config";
import {
  cultureOf,
  loadLanguages,
  resetLanguages,
  resolveLanguageIn,
  toProjectLanguages,
  useLanguagesStore,
} from "./languages";

const okResponse = (body: unknown) =>
  ({ ok: true, text: () => Promise.resolve(JSON.stringify(body)) }) as Response;

describe("toProjectLanguages", () => {
  it("maps the service list, one entry per language, English always present", () => {
    expect(
      toProjectLanguages([
        {
          LanguageCode: "xx-XX",
          LanguageName: "Test language",
          IsDefault: true,
        },
        { languageCode: "xx-YY", languageName: "Test language (YY)" },
        { languageCode: "yy-YY", languageName: "Other test language" },
      ]),
    ).toEqual([
      { code: "xx", culture: "xx-XX", title: "Test language", isDefault: true },
      {
        code: "yy",
        culture: "yy-YY",
        title: "Other test language",
        isDefault: false,
      },
      { code: "en", culture: "en-US", title: "English" },
    ]);
  });

  it("prefers the default culture when a language has several", () => {
    expect(
      toProjectLanguages([
        { languageCode: "en-GB", languageName: "English (UK)" },
        {
          languageCode: "en-US",
          languageName: "English (US)",
          isDefault: true,
        },
      ]),
    ).toEqual([
      { code: "en", culture: "en-US", title: "English (US)", isDefault: true },
    ]);
  });

  it("rejects anything that is not a list of languages", () => {
    expect(toProjectLanguages({})).toBeNull();
    expect(toProjectLanguages([])).toBeNull();
    expect(toProjectLanguages([{ languageName: "No code" }])).toBeNull();
  });
});

describe("resolveLanguageIn", () => {
  const list = [
    { code: "en", culture: "en-US", title: "English" },
    { code: "xx", culture: "xx-XX", title: "Test language", isDefault: true },
  ];

  it("keeps a stored language the project offers", () => {
    expect(resolveLanguageIn("en", list, true)).toBe("en");
    expect(resolveLanguageIn("xx-XX", list, true)).toBe("xx");
  });

  it("falls back to the project's default", () => {
    expect(resolveLanguageIn(undefined, list, true)).toBe("xx");
    expect(resolveLanguageIn("yy", list, true)).toBe("xx");
  });

  it("keeps any stored language until the list is known", () => {
    expect(resolveLanguageIn("yy", list, false)).toBe("yy");
  });
});

describe("loadLanguages", () => {
  beforeEach(() => {
    resetLanguages();
    localStorage.clear();
    configureI18n({
      baseUrl: () => "https://loc.example/",
      blocksKey: () => "key-1",
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("loads the project's languages once with the project key and caches them", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      okResponse([
        { languageCode: "en-US", languageName: "English", isDefault: true },
        { languageCode: "xx-ZZ", languageName: "Test language (ZZ)" },
      ]),
    );
    vi.stubGlobal("fetch", fetchMock);

    await loadLanguages();
    await loadLanguages();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://loc.example/api/Language/Gets");
    expect(init.headers).toEqual({ "X-Blocks-Key": "key-1" });
    expect(useLanguagesStore.getState().loaded).toBe(true);
    expect(cultureOf("xx")).toBe("xx-ZZ");
    expect(localStorage.getItem("blocks-i18n:languages")).toContain("xx-ZZ");
  });

  it("keeps English only when the service fails and nothing is cached", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("down")));
    await loadLanguages();
    expect(useLanguagesStore.getState().languages.map((l) => l.code)).toEqual([
      "en",
    ]);
    expect(useLanguagesStore.getState().loaded).toBe(false);
  });

  it("uses the cached list when the service fails", async () => {
    localStorage.setItem(
      "blocks-i18n:languages",
      JSON.stringify([
        { languageCode: "en-US", languageName: "English" },
        { languageCode: "xx-XX", languageName: "Test language" },
      ]),
    );
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("down")));
    await loadLanguages();
    expect(useLanguagesStore.getState().languages.map((l) => l.code)).toEqual([
      "en",
      "xx",
    ]);
  });

  it("does not call the service without base url or key", async () => {
    configureI18n({ baseUrl: () => "", blocksKey: () => "" });
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    await loadLanguages();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
