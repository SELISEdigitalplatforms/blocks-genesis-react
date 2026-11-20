import { beforeEach, describe, expect, it, vi } from "vitest";

const h = vi.hoisted(() => ({ env: {} as Record<string, string> }));
vi.mock("@/lib/runtime-env", () => ({
  getRuntimeEnv: (key: string) => h.env[key] ?? "",
}));

import {
  getMergedAreaBaseUrl,
  isMergedAreaKey,
  MERGED_AREA_KEYS,
} from "./merged-area";

const os = "https://dev-os.blocksdevelopers.com";

describe("getMergedAreaBaseUrl", () => {
  beforeEach(() => {
    h.env = {};
  });

  it.each(MERGED_AREA_KEYS)("uses %s while the app still sets it", (key) => {
    h.env = { [key]: "https://old.example.test", BLOCKS_OS_BASE_URL: os };
    expect(getMergedAreaBaseUrl(key)).toBe("https://old.example.test");
  });

  it.each(MERGED_AREA_KEYS)(
    "falls back to BLOCKS_OS_BASE_URL when %s is unset",
    (key) => {
      h.env = { BLOCKS_OS_BASE_URL: os };
      expect(getMergedAreaBaseUrl(key)).toBe(os);
    },
  );

  it("is empty when neither key is set", () => {
    expect(getMergedAreaBaseUrl("BLOCKS_LOGIC_BASE_URL")).toBe("");
  });
});

describe("isMergedAreaKey", () => {
  it("knows the four merged areas and nothing else", () => {
    expect(MERGED_AREA_KEYS.every(isMergedAreaKey)).toBe(true);
    expect(isMergedAreaKey("BLOCKS_OS_BASE_URL")).toBe(false);
    expect(isMergedAreaKey("BLOCKS_RELEASE_BASE_URL")).toBe(false);
  });
});
