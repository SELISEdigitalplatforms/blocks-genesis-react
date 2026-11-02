import type Rollbar from "rollbar";
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

  describe("checkIgnore", () => {
    const checkIgnore = (
      ...call: Parameters<NonNullable<Rollbar.Configuration["checkIgnore"]>>
    ) => {
      const configured = createRollbarConfig({
        service: "blocks-os",
      }).checkIgnore;
      if (!configured) throw new Error("checkIgnore is not configured");
      return configured(...call);
    };

    // What rollbar 3.1.0's browser handlers hand `checkIgnore` for a global item: the message
    // first, then the raw value, the context and (for a rejection) the promise.
    const unhandledRejection = (
      reason: unknown,
      payload: Record<string, unknown>,
    ) =>
      checkIgnore(
        true,
        [
          reason instanceof Error ? reason.message : JSON.stringify(reason),
          reason,
          undefined,
          Promise.resolve(),
        ] as Rollbar.LogArgument[],
        payload,
      );

    const trace = (
      exception: { class: string; message: string },
      filenames: string[] = ["https://os.seliseblocks.com/assets/index-abc.js"],
    ) => ({
      body: {
        trace: {
          frames: filenames.map((filename) => ({ filename })),
          exception,
        },
      },
    });

    // §7 #1, H1
    it("drops a view-transition rejection", () => {
      const reason = new DOMException(
        "Transition was aborted because of invalid state. Document hidden",
        "InvalidStateError",
      );

      expect(
        unhandledRejection(
          reason,
          trace({ class: "InvalidStateError", message: reason.message }),
        ),
      ).toBe(true);
    });

    // H7 (both forms), H9, §10 step 8. The payload message is deliberately one no rule matches, so
    // the raw reason in `args[1]` is what decides.
    it.each([
      Object.assign(new Error("Canceled"), { name: "Canceled" }),
      { type: "cancelation", msg: "operation is manually canceled" },
      new Error("reCAPTCHA Timeout (b)"),
    ])("drops the rejection %j", (reason) => {
      expect(
        unhandledRejection(
          reason,
          trace({ class: "(unknown)", message: JSON.stringify(reason) }),
        ),
      ).toBe(true);
    });

    // H8: a bare Event reason only reaches Rollbar's payload as its stringified form.
    it("drops a bare Event rejection", () => {
      expect(
        unhandledRejection(
          new Event("error"),
          trace({ class: "(unknown)", message: '{"isTrusted":true}' }, [
            "(unknown)",
          ]),
        ),
      ).toBe(true);
    });

    // §7 #5 and #6, H4, C2
    it("drops an uncaught error from an extension, but not one with an app frame", () => {
      const error = new Error("x is not defined");
      const extension =
        "chrome-extension://eppiocemhmnlbhjplcgkofciiegomcon/executors/200.js";
      const args = [error.message, error, undefined] as Rollbar.LogArgument[];
      const exception = { class: "ReferenceError", message: error.message };

      expect(
        checkIgnore(true, args, trace(exception, [extension, extension])),
      ).toBe(true);
      expect(
        checkIgnore(
          true,
          args,
          trace(exception, [
            extension,
            "https://os.seliseblocks.com/assets/index-abc.js",
          ]),
        ),
      ).toBe(false);
    });

    // An uncaught error without an Error object is built from `[message, context]`.
    it("classifies from the payload when an uncaught item carries no raw value", () => {
      expect(
        checkIgnore(
          true,
          ["Failed to fetch", undefined],
          trace({ class: "TypeError", message: "Failed to fetch" }),
        ),
      ).toBe(true);
    });

    // §10 step 7, C8
    it("keeps a genuine unhandled rejection", () => {
      const reason = new TypeError(
        "Cannot read properties of undefined (reading 'x')",
      );

      expect(
        unhandledRejection(
          reason,
          trace({ class: "TypeError", message: reason.message }),
        ),
      ).toBe(false);
    });

    // `rollbar.error(err, custom)` and friends pass the error first.
    it("classifies the first argument of a direct call", () => {
      const network = new TypeError("Failed to fetch");
      const bug = new Error("boom");

      expect(
        checkIgnore(
          false,
          [network, { source: "react-query" }],
          trace({ class: "TypeError", message: network.message }),
        ),
      ).toBe(true);
      expect(
        checkIgnore(
          false,
          [bug, { source: "react-query" }],
          trace({ class: "Error", message: bug.message }),
        ),
      ).toBe(false);
      expect(
        checkIgnore(
          false,
          [{ type: "cancelation" }, { source: "monaco" }],
          trace({ class: "(unknown)", message: "{}" }),
        ),
      ).toBe(true);
    });

    // C1
    it("fails open when the payload cannot be read", () => {
      const payload = Object.defineProperty({}, "body", {
        get() {
          throw new Error("getter");
        },
      });

      expect(
        checkIgnore(false, [new TypeError("Failed to fetch")], payload),
      ).toBe(false);
    });

    // H13
    it("is set alongside the default and app-supplied ignored messages", () => {
      const config = createRollbarConfig({
        service: "blocks-os",
        extraIgnoredMessages: ["Non-Error promise rejection captured"],
      });

      expect(config.checkIgnore).toEqual(expect.any(Function));
      expect(config.ignoredMessages).toEqual([
        "ResizeObserver loop limit exceeded",
        "ResizeObserver loop completed with undelivered notifications",
        "Script error.",
        "Non-Error promise rejection captured",
      ]);
    });
  });
});
