import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const h = vi.hoisted(() => ({
  appLogoUrl: undefined as unknown,
}));

vi.mock("@/hooks/use-blocks-app-config-store", () => ({
  useBlocksAppConfigStore: () => ({ config: { appLogoUrl: h.appLogoUrl } }),
}));

import { useLogo } from "@/hooks/use-logo";

describe("useLogo", () => {
  it("returns undefined for both variants when no logo is configured", () => {
    h.appLogoUrl = undefined;
    const { result } = renderHook(() => useLogo());
    expect(result.current.appLightLogo).toBeUndefined();
    expect(result.current.appDarkLogo).toBeUndefined();
  });

  it("uses a single string url for both variants", () => {
    h.appLogoUrl = "https://cdn.test/logo.svg";
    const { result } = renderHook(() => useLogo());
    expect(result.current.appLightLogo).toBe("https://cdn.test/logo.svg");
    expect(result.current.appDarkLogo).toBe("https://cdn.test/logo.svg");
  });

  it("resolves per-variant urls from an object", () => {
    h.appLogoUrl = {
      light: "https://cdn.test/light.svg",
      dark: "https://cdn.test/dark.svg",
    };
    const { result } = renderHook(() => useLogo());
    expect(result.current.appLightLogo).toBe("https://cdn.test/light.svg");
    expect(result.current.appDarkLogo).toBe("https://cdn.test/dark.svg");
  });
});
