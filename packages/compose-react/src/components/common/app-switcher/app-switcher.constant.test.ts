import { describe, it, expect, beforeEach, vi } from "vitest";

const h = vi.hoisted(() => ({ env: {} as Record<string, string> }));
vi.mock("@/lib/runtime-env", () => ({
  getRuntimeEnv: (key: string) => h.env[key] ?? "",
}));
vi.mock("@/lib", () => ({
  getRuntimeEnv: (key: string) => h.env[key] ?? "",
}));

// An app that still sets the merged areas' keys, so their tiles show (see the merged-tile test below).
const MERGED_KEYS_SET = {
  BLOCKS_LOGIC_BASE_URL: "https://logic.example.test",
  BLOCKS_LOCALIZATION_BASE_URL: "https://localization.example.test",
  BLOCKS_DATA_BASE_URL: "https://data.example.test",
  BLOCKS_MONITOR_BASE_URL: "https://monitor.example.test",
};

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
      ...MERGED_KEYS_SET,
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
      ...MERGED_KEYS_SET,
      BLOCKS_ALLOWED_SERVICES:
        " blocks-os , blocks-logic , blocks-data , blocks-localization , blocks-monitor , blocks-release , blocks-studio , blocks-utilities , blocks-agents ",
      BLOCKS_FEATURE_AGENTS: "true",
      BLOCKS_FEATURE_STUDIO: "true",
    };
    const { filteredAppSwitcherData } =
      await import("@/components/common/app-switcher/app-switcher.constant");
    expect(filteredAppSwitcherData.length).toBe(9);
  });

  it("hides Agents and Studio when their feature settings are not set", async () => {
    const { filteredAppSwitcherData } =
      await import("@/components/common/app-switcher/app-switcher.constant");
    const ids = filteredAppSwitcherData.map((a) => a.id);
    expect(ids).not.toContain("blocks-agents");
    expect(ids).not.toContain("blocks-studio");
    expect(ids).toContain("blocks-os");
  });

  it("hides Agents and Studio when their feature settings are not true", async () => {
    h.env = { BLOCKS_FEATURE_AGENTS: "false", BLOCKS_FEATURE_STUDIO: "1" };
    const { filteredAppSwitcherData } =
      await import("@/components/common/app-switcher/app-switcher.constant");
    const ids = filteredAppSwitcherData.map((a) => a.id);
    expect(ids).not.toContain("blocks-agents");
    expect(ids).not.toContain("blocks-studio");
  });

  it("lists Agents and Studio each when its own feature setting is true", async () => {
    h.env = { BLOCKS_FEATURE_AGENTS: " TRUE " };
    const agentsOnly = (
      await import("@/components/common/app-switcher/app-switcher.constant")
    ).filteredAppSwitcherData.map((a) => a.id);
    expect(agentsOnly).toContain("blocks-agents");
    expect(agentsOnly).not.toContain("blocks-studio");

    vi.resetModules();
    h.env = { BLOCKS_FEATURE_STUDIO: "true" };
    const studioOnly = (
      await import("@/components/common/app-switcher/app-switcher.constant")
    ).filteredAppSwitcherData.map((a) => a.id);
    expect(studioOnly).toContain("blocks-studio");
    expect(studioOnly).not.toContain("blocks-agents");
  });

  it("still applies the BLOCKS_ALLOWED_SERVICES whitelist to an enabled feature", async () => {
    h.env = {
      BLOCKS_ALLOWED_SERVICES: "blocks-os",
      BLOCKS_FEATURE_AGENTS: "true",
    };
    const { filteredAppSwitcherData } =
      await import("@/components/common/app-switcher/app-switcher.constant");
    expect(filteredAppSwitcherData.map((a) => a.id)).toEqual(["blocks-os"]);
  });

  it("falls back to all enabled apps when the env var is empty", async () => {
    h.env = {
      ...MERGED_KEYS_SET,
      BLOCKS_ALLOWED_SERVICES: "",
    };
    const { filteredAppSwitcherData } =
      await import("@/components/common/app-switcher/app-switcher.constant");
    expect(filteredAppSwitcherData.length).toBeGreaterThan(0);
  });

  it.each([
    ["blocks-logic", "BLOCKS_LOGIC_BASE_URL"],
    ["blocks-localization", "BLOCKS_LOCALIZATION_BASE_URL"],
    ["blocks-data", "BLOCKS_DATA_BASE_URL"],
    ["blocks-monitor", "BLOCKS_MONITOR_BASE_URL"],
  ])("shows the merged %s tile only while %s is set", async (id, key) => {
    h.env = { BLOCKS_OS_BASE_URL: "https://os.example.test" };
    let mod =
      await import("@/components/common/app-switcher/app-switcher.constant");
    expect(mod.filteredAppSwitcherData.map((a) => a.id)).not.toContain(id);
    expect(mod.filteredAppSwitcherData.map((a) => a.id)).toContain("blocks-os");

    vi.resetModules();
    h.env = {
      BLOCKS_OS_BASE_URL: "https://os.example.test",
      [key]: "https://old.example.test",
    };
    mod =
      await import("@/components/common/app-switcher/app-switcher.constant");
    expect(mod.filteredAppSwitcherData.map((a) => a.id)).toContain(id);
  });
});
