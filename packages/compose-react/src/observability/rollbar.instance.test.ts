import { beforeEach, describe, expect, it, vi } from "vitest";

// Disabled instance: the shared getter constructs a real Rollbar, and the test environment's
// runtime-env proxy would otherwise hand it a token and let it attempt transmission.
const h = vi.hoisted(() => ({ runtimeEnv: {} as Record<string, string> }));

vi.mock("@/lib/runtime-env", () => ({
  getRuntimeEnv: (key: string) => h.runtimeEnv[key] ?? "",
}));

import { getRollbar } from "./rollbar.instance";

describe("getRollbar", () => {
  beforeEach(() => {
    h.runtimeEnv = {};
  });

  it("hands out one instance, so module-scope reporters and the provider share a client", () => {
    const first = getRollbar({ service: "blocks-os" });
    const second = getRollbar({ service: "blocks-os" });

    expect(second).toBe(first);
  });

  it("keeps the first call's options, whichever call site got there first", () => {
    const first = getRollbar({ service: "blocks-os" });

    expect(getRollbar({ service: "blocks-iam" })).toBe(first);
  });

  // The unconfigured client carries a stand-in access token so `@rollbar/react`'s Provider will
  // accept it. That token is inert, and this is what says so: `enabled: false` stops the notifier
  // before it queues anything, which is upstream of every code path that reads a token.
  it("transmits nothing while unconfigured, despite carrying a stand-in token", async () => {
    const send = vi
      .spyOn(XMLHttpRequest.prototype, "send")
      .mockImplementation(() => {});
    const rollbar = getRollbar({ service: "blocks-os" });

    const rejection = await new Promise<Error | null>((resolve) => {
      rollbar.error(new Error("boom"), (error: Error | null) => resolve(error));
    });

    expect(rejection?.message).toBe("Rollbar is not enabled");
    expect(send).not.toHaveBeenCalled();
  });
});
