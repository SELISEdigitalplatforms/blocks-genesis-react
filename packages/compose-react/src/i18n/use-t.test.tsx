import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAppSettingsStore } from "@/store/app-settings.store";
import { registerTranslations, useI18nStore } from "./i18n.store";
import { configureI18n, resetI18nRequests } from "./load-module";
import { splitKey, tStatic, useT } from "./use-t";

const MODULE = "os.idp";
const COMMON_SAVE = "common:SAVE";

describe("useT", () => {
  beforeEach(() => {
    resetI18nRequests();
    useI18nStore.setState({ bundled: {}, remote: {} });
    configureI18n({ baseUrl: () => "", blocksKey: () => "" });
    registerTranslations(MODULE, { SIGN_IN: "Sign in" });
    registerTranslations("common", { SAVE: "Save" });
    act(() => useAppSettingsStore.getState().setSettings({ language: "en" }));
    vi.restoreAllMocks();
  });

  it("shows bundled English", () => {
    const { result } = renderHook(() => useT(MODULE));
    expect(result.current.t("SIGN_IN")).toBe("Sign in");
    expect(result.current.t(COMMON_SAVE)).toBe("Save");
  });

  it("shows the other language once it arrives and updates on language change", () => {
    const { result } = renderHook(() => useT(MODULE));
    act(() => useAppSettingsStore.getState().setSettings({ language: "xx" }));
    expect(result.current.t("SIGN_IN")).toBe("Sign in");

    act(() =>
      useI18nStore
        .getState()
        .setRemote("xx", MODULE, { SIGN_IN: "[xx] Sign in" }),
    );
    expect(result.current.language).toBe("xx");
    expect(result.current.t("SIGN_IN")).toBe("[xx] Sign in");
  });

  it("resolves values from the published other-language text", () => {
    registerTranslations(MODULE, { DELETED: "Deleted {{count}} items" });
    const { result } = renderHook(() => useT(MODULE));
    act(() => useAppSettingsStore.getState().setSettings({ language: "xx" }));
    act(() =>
      useI18nStore
        .getState()
        .setRemote("xx", MODULE, { DELETED: "{{count}} Einträge gelöscht" }),
    );
    expect(result.current.t("DELETED", { count: 3 })).toBe(
      "3 Einträge gelöscht",
    );
  });

  it("tStatic reads the current language", () => {
    useI18nStore.getState().setRemote("xx", "common", { SAVE: "Speichern" });
    act(() => useAppSettingsStore.getState().setSettings({ language: "xx" }));
    expect(tStatic(MODULE, COMMON_SAVE)).toBe("Speichern");
  });
});

describe("useT with another module's key", () => {
  beforeEach(() => {
    resetI18nRequests();
    useI18nStore.setState({ bundled: {}, remote: {} });
    configureI18n({
      baseUrl: () => "https://loc.example",
      blocksKey: () => "key-1",
    });
    registerTranslations("os.other", { TITLE: "Title" });
    act(() => useAppSettingsStore.getState().setSettings({ language: "xx" }));
  });

  it("loads that module's other-language text too", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ TITLE: "Titel" })),
    } as Response);
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useT(MODULE));
    expect(result.current.t("os.other:TITLE")).toBe("Title");

    await vi.waitFor(() =>
      expect(result.current.t("os.other:TITLE")).toBe("Titel"),
    );
    expect(
      fetchMock.mock.calls.some(([url]) =>
        String(url).includes("ModuleName=os.other"),
      ),
    ).toBe(true);
    vi.unstubAllGlobals();
  });
});

describe("splitKey", () => {
  it("splits a namespaced key", () => {
    expect(splitKey(MODULE, COMMON_SAVE)).toEqual({
      module: "common",
      key: "SAVE",
    });
    expect(splitKey(MODULE, "SIGN_IN")).toEqual({
      module: MODULE,
      key: "SIGN_IN",
    });
  });
});
