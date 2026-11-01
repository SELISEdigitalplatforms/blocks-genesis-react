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

  it("shows German once it arrives and updates on language change", () => {
    const { result } = renderHook(() => useT(MODULE));
    act(() => useAppSettingsStore.getState().setSettings({ language: "de" }));
    expect(result.current.t("SIGN_IN")).toBe("Sign in");

    act(() =>
      useI18nStore.getState().setRemote("de", MODULE, { SIGN_IN: "Anmelden" }),
    );
    expect(result.current.language).toBe("de");
    expect(result.current.t("SIGN_IN")).toBe("Anmelden");
  });

  it("tStatic reads the current language", () => {
    useI18nStore.getState().setRemote("de", "common", { SAVE: "Speichern" });
    act(() => useAppSettingsStore.getState().setSettings({ language: "de" }));
    expect(tStatic(MODULE, COMMON_SAVE)).toBe("Speichern");
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
