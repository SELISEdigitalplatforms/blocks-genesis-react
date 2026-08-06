import { describe, it, expect, beforeEach, vi } from "vitest";

const h = vi.hoisted(() => ({ env: {} as Record<string, string> }));
vi.mock("@/lib/runtime-env", () => ({
  getRuntimeEnv: (key: string) => h.env[key] ?? "",
}));
vi.mock("@/lib", () => ({
  getRuntimeEnv: (key: string) => h.env[key] ?? "",
}));

describe("filteredAppSwitcherData", () => {
  beforeEach(() => {
    vi.resetModules();
    h.env = {};
  });

  it("exposes the enabled blocks apps", async () => {
    const { filteredAppSwitcherData } =
      await import("@/components/common/app-switcher/app-switcher.constant");
    expect(Array.isArray(filteredAppSwitcherData)).toBe(true);
    expect(filteredAppSwitcherData.length).toBeGreaterThan(0);
  });

  it("keeps only apps that are not disabled", async () => {
    const { filteredAppSwitcherData } =
      await import("@/components/common/app-switcher/app-switcher.constant");
    for (const app of filteredAppSwitcherData) {
      const disabled =
        typeof app.isDisabled === "function"
          ? app.isDisabled()
          : app.isDisabled;
      expect(disabled).toBeFalsy();
    }
  });

  it("gives every app an id and a label", async () => {
    const { filteredAppSwitcherData } =
      await import("@/components/common/app-switcher/app-switcher.constant");
    for (const app of filteredAppSwitcherData) {
      expect(app.id).toBeTruthy();
      expect(app.label).toBeTruthy();
    }
  });

  it("filters by BLOCKS_ALLOWED_SERVICES whitelist", async () => {
    h.env = {
      BLOCKS_ALLOWED_SERVICES:
        "blocks-os,blocks-logic,blocks-data,blocks-localization",
    };
    const { filteredAppSwitcherData } =
      await import("@/components/common/app-switcher/app-switcher.constant");
    expect(filteredAppSwitcherData.map((a) => a.id).sort()).toEqual([
      "blocks-data",
      "blocks-localization",
      "blocks-logic",
      "blocks-os",
    ]);
  });

  it("treats whitespace around comma-separated entries as a single token", async () => {
    h.env = {
      BLOCKS_ALLOWED_SERVICES:
        " blocks-os , blocks-logic , blocks-data , blocks-localization , blocks-monitor , blocks-release , blocks-studio , blocks-utilities , blocks-agents ",
    };
    const { filteredAppSwitcherData } =
      await import("@/components/common/app-switcher/app-switcher.constant");
    expect(filteredAppSwitcherData.length).toBe(9);
  });

  it("falls back to all enabled apps when the env var is empty", async () => {
    h.env = { BLOCKS_ALLOWED_SERVICES: "" };
    const { filteredAppSwitcherData } =
      await import("@/components/common/app-switcher/app-switcher.constant");
    expect(filteredAppSwitcherData.length).toBeGreaterThan(0);
  });
});
