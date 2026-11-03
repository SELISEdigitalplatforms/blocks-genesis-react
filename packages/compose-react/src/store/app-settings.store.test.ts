import { describe, it, expect, beforeEach } from "vitest";
import { useAppSettingsStore } from "@/store/app-settings.store";

describe("useAppSettingsStore", () => {
  beforeEach(() => useAppSettingsStore.getState().resetSettings());

  it("defaults to the system theme and no chosen language", () => {
    const settings = useAppSettingsStore.getState().getSettings();
    expect(settings.theme).toBe("system");
    // Unset: the UI starts in the project's default language.
    expect(settings.language).toBeUndefined();
  });

  it("setSettings merges partial settings", () => {
    useAppSettingsStore.getState().setSettings({ language: "xx" });
    useAppSettingsStore.getState().setSettings({ theme: "dark" });
    expect(useAppSettingsStore.getState().getSettings().theme).toBe("dark");
    expect(useAppSettingsStore.getState().getSettings().language).toBe("xx");
  });

  it("setSystemTheme updates the reactive system theme", () => {
    useAppSettingsStore.getState().setSystemTheme("dark");
    expect(useAppSettingsStore.getState().systemTheme).toBe("dark");
  });

  it("resetSettings restores the defaults", () => {
    useAppSettingsStore
      .getState()
      .setSettings({ theme: "light", language: "fr" });
    useAppSettingsStore.getState().resetSettings();
    const settings = useAppSettingsStore.getState().getSettings();
    expect(settings.theme).toBe("system");
    expect(settings.language).toBeUndefined();
  });
});
