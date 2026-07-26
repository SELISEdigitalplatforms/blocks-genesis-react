import { describe, it, expect } from "vitest";
import { CreateAppConfigStore } from "@/store/app-config.store";

describe("CreateAppConfigStore", () => {
  it("defaults to blocks-os with an empty logo", () => {
    const store = CreateAppConfigStore();
    expect(store.getState().getConfig()).toEqual({
      name: "blocks-os",
      appLogoUrl: "",
    });
  });

  it("applies the initial config override", () => {
    const store = CreateAppConfigStore({ name: "blocks-iam" });
    expect(store.getState().getConfig().name).toBe("blocks-iam");
  });

  it("setConfig merges partial updates", () => {
    const store = CreateAppConfigStore();
    store.getState().setConfig({ appLogoUrl: "logo.png" });
    expect(store.getState().getConfig().appLogoUrl).toBe("logo.png");
    expect(store.getState().getConfig().name).toBe("blocks-os");
  });

  it("resetConfig restores the initial config", () => {
    const store = CreateAppConfigStore({ name: "blocks-iam" });
    store.getState().setConfig({ name: "blocks-os" });
    store.getState().resetConfig();
    expect(store.getState().getConfig().name).toBe("blocks-iam");
  });
});
