import { beforeEach, describe, expect, it, vi } from "vitest";

// `vitest.setup.ts` proxies window.__BLOCKS_ENV__ so every key resolves to "https://test.local".
// That makes the unconfigured case unreachable through the real getter, so the runtime env is
// mocked here instead -- the same approach client.test.ts takes.
const h = vi.hoisted(() => ({ runtimeEnv: {} as Record<string, string> }));

vi.mock("@/lib/runtime-env", () => ({
  getRuntimeEnv: (key: string) => h.runtimeEnv[key] ?? "",
}));

import {
  createRollbarConfig,
  UNCONFIGURED_ACCESS_TOKEN,
} from "./rollbar.config";

describe("createRollbarConfig", () => {
  beforeEach(() => {
    h.runtimeEnv = {};
  });

  it("stays disabled until a client token is seeded", () => {
    expect(createRollbarConfig({ service: "blocks-os" })).toMatchObject({
      enabled: false,
    });
  });

  // An empty token is what `@rollbar/react`'s Provider rejects outright, and it rejects it from a
  // constructor that sits above the error boundary -- so the unconfigured case has to carry a
  // stand-in or the whole app renders nothing.
  it("still carries a token when unconfigured, so the provider can be mounted", () => {
    expect(createRollbarConfig({ service: "blocks-os" }).accessToken).toBe(
      UNCONFIGURED_ACCESS_TOKEN,
    );
  });

  it("enables reporting once a token is present", () => {
    h.runtimeEnv.BLOCKS_ROLLBAR_CLIENT_TOKEN = "client-token";

    expect(createRollbarConfig({ service: "blocks-os" })).toMatchObject({
      accessToken: "client-token",
      enabled: true,
      captureUncaught: true,
      captureUnhandledRejections: true,
    });
  });

  it("identifies the service and which half of it is reporting", () => {
    expect(
      createRollbarConfig({ service: "blocks-iam" }).payload?.custom,
    ).toMatchObject({ service: "blocks-iam", component: "client" });
  });

  it("uses the seeded environment name", () => {
    h.runtimeEnv.BLOCKS_ROLLBAR_ENV = "stg";

    expect(createRollbarConfig({ service: "blocks-os" }).environment).toBe(
      "stg",
    );
  });

  it("falls back to 'unknown' rather than reporting into an unnamed environment", () => {
    expect(createRollbarConfig({ service: "blocks-os" }).environment).toBe(
      "unknown",
    );
  });

  it("scrubs the platform's own credential fields", () => {
    expect(createRollbarConfig({ service: "blocks-os" }).scrubFields).toEqual(
      expect.arrayContaining(["x-blocks-key", "Authorization", "refreshToken"]),
    );
  });

  it("appends app-supplied scrub fields instead of replacing the platform list", () => {
    const { scrubFields } = createRollbarConfig({
      service: "blocks-os",
      extraScrubFields: ["tenantSalt"],
    });

    expect(scrubFields).toEqual(
      expect.arrayContaining(["x-blocks-key", "tenantSalt"]),
    );
  });

  it("appends app-supplied ignored messages", () => {
    const { ignoredMessages } = createRollbarConfig({
      service: "blocks-os",
      extraIgnoredMessages: ["Non-Error promise rejection captured"],
    });

    expect(ignoredMessages).toEqual(
      expect.arrayContaining([
        "Script error.",
        "Non-Error promise rejection captured",
      ]),
    );
  });

  it("only claims source-map support when a code version identifies the build", () => {
    expect(
      createRollbarConfig({ service: "blocks-os" }).payload?.client,
    ).toMatchObject({ javascript: { source_map_enabled: false } });

    expect(
      createRollbarConfig({ service: "blocks-os", codeVersion: "abc123" })
        .payload?.client,
    ).toMatchObject({
      javascript: { source_map_enabled: true, code_version: "abc123" },
    });
  });
});
