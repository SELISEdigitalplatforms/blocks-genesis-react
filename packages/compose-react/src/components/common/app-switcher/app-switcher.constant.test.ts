import { describe, it, expect } from "vitest";
import { filteredAppSwitcherData } from "@/components/common/app-switcher/app-switcher.constant";

describe("filteredAppSwitcherData", () => {
  it("exposes the enabled blocks apps", () => {
    expect(Array.isArray(filteredAppSwitcherData)).toBe(true);
    expect(filteredAppSwitcherData.length).toBeGreaterThan(0);
  });

  it("keeps only apps that are not disabled", () => {
    for (const app of filteredAppSwitcherData) {
      const disabled =
        typeof app.isDisabled === "function"
          ? app.isDisabled()
          : app.isDisabled;
      expect(disabled).toBeFalsy();
    }
  });

  it("gives every app a id and a label", () => {
    for (const app of filteredAppSwitcherData) {
      expect(app.id).toBeTruthy();
      expect(app.label).toBeTruthy();
    }
  });
});
