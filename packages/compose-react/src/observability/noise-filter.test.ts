import { afterEach, describe, expect, it, vi } from "vitest";
import {
  classifyReportingNoise,
  isNetworkFailure,
  type RollbarPayloadLike,
} from "./noise-filter";

// Payloads are shaped as rollbar 3.1.0's browser transforms build `item.data`: an error becomes
// `body.trace` (or `body.trace_chain` when it has a cause), a logged string `body.message`.
const tracePayload = (
  exception: { class?: string; message?: string },
  filenames: string[] = [],
): RollbarPayloadLike => ({
  body: {
    trace: {
      frames: filenames.map((filename, lineno) => ({
        filename,
        lineno,
        colno: 1,
        method: "fn",
      })),
      exception,
    },
  },
});

const domException = (name: string, message: string) =>
  new DOMException(message, name);

const named = (name: string, message: string) =>
  Object.assign(new Error(message), { name });

const EXTENSION_FRAME =
  "chrome-extension://eppiocemhmnlbhjplcgkofciiegomcon/executors/200.js";
const APP_FRAME = "https://os.seliseblocks.com/assets/index-abc.js";

describe("classifyReportingNoise", () => {
  describe("network", () => {
    it.each([
      new TypeError("Failed to fetch"),
      new TypeError("Failed to fetch (api.seliseblocks.com)"),
      new TypeError("NetworkError when attempting to fetch resource."),
      new TypeError("Load failed"),
      domException("AbortError", "signal is aborted without reason"),
      named("AbortError", "The user aborted a request."),
    ])("matches %s", (error) => {
      expect(classifyReportingNoise(error)).toBe("network");
    });

    it("matches from the payload when the value carries no class or message", () => {
      expect(
        classifyReportingNoise(
          "Failed to fetch",
          tracePayload({ class: "TypeError", message: "Failed to fetch" }),
        ),
      ).toBe("network");
    });

    // C8: a TypeError is a bug unless its message is one of the browser's network messages.
    it.each([
      "Cannot read properties of undefined (reading 'id')",
      "Load failed to parse",
      "NetworkError when attempting to fetch resource",
      "fetch failed",
    ])("does not match TypeError(%j) by class alone", (message) => {
      expect(classifyReportingNoise(new TypeError(message))).toBeNull();
    });

    it("prefers the value's own class over the payload's", () => {
      expect(
        classifyReportingNoise(
          new TypeError("Failed to fetch"),
          tracePayload({ class: "(unknown)", message: "Failed to fetch" }),
        ),
      ).toBe("network");
    });

    it("does not match the network messages on another class", () => {
      expect(classifyReportingNoise(new Error("Failed to fetch"))).toBeNull();
    });
  });

  describe("view-transition", () => {
    // §7 #1
    it("matches the hidden-document rejection", () => {
      expect(
        classifyReportingNoise(
          domException(
            "InvalidStateError",
            "Transition was aborted because of invalid state. Document hidden",
          ),
        ),
      ).toBe("view-transition");
    });

    it("matches a timed-out transition, case-insensitively", () => {
      expect(
        classifyReportingNoise(
          domException(
            "TimeoutError",
            "TRANSITION was aborted because of timeout in DOM update",
          ),
        ),
      ).toBe("view-transition");
    });

    it("matches from the payload alone", () => {
      expect(
        classifyReportingNoise(
          "Transition was skipped",
          tracePayload({
            class: "InvalidStateError",
            message: "Transition was skipped",
          }),
        ),
      ).toBe("view-transition");
    });

    // First match wins, and both rules drop: an aborted transition is classified as `network`.
    it("leaves an AbortError about a transition to the network rule", () => {
      expect(
        classifyReportingNoise(
          domException("AbortError", "Transition was skipped"),
        ),
      ).toBe("network");
    });

    // C9
    it.each([
      domException("InvalidStateError", "The object is in an invalid state."),
      domException("TimeoutError", "signal timed out"),
      new Error("transition failed"),
    ])("does not match %s", (error) => {
      expect(classifyReportingNoise(error)).toBeNull();
    });
  });

  describe("extension", () => {
    // §7 #5
    it("matches when every frame is an extension URL", () => {
      expect(
        classifyReportingNoise(
          new Error("x is not defined"),
          tracePayload(
            { class: "ReferenceError", message: "x is not defined" },
            [EXTENSION_FRAME, EXTENSION_FRAME],
          ),
        ),
      ).toBe("extension");
    });

    it.each([
      "moz-extension://4a3c/content.js",
      "safari-extension://com.example.ext/script.js",
      "safari-web-extension://8E1F/content.js",
    ])("recognises %s", (filename) => {
      expect(
        classifyReportingNoise(
          new Error("boom"),
          tracePayload({ class: "Error", message: "boom" }, [filename]),
        ),
      ).toBe("extension");
    });

    it("reads the frames of the first trace in a trace chain", () => {
      expect(
        classifyReportingNoise(new Error("boom"), {
          body: {
            trace_chain: [
              {
                frames: [{ filename: EXTENSION_FRAME }],
                exception: { class: "Error", message: "boom" },
              },
              {
                frames: [{ filename: APP_FRAME }],
                exception: { class: "Error", message: "cause" },
              },
            ],
          },
        }),
      ).toBe("extension");
    });

    // §7 #6, C2
    it("reports a stack that also has an app frame", () => {
      expect(
        classifyReportingNoise(
          new Error("boom"),
          tracePayload({ class: "Error", message: "boom" }, [
            "chrome-extension://x/inject.js",
            APP_FRAME,
          ]),
        ),
      ).toBeNull();
    });

    // C3
    it.each<[string, RollbarPayloadLike | undefined]>([
      ["no payload", undefined],
      ["no trace", { body: { message: { body: "boom" } } }],
      ["no frames", { body: { trace: { exception: { class: "Error" } } } }],
      ["empty frames", tracePayload({ class: "Error", message: "boom" })],
    ])("never matches with %s", (_, payload) => {
      expect(classifyReportingNoise(new Error("boom"), payload)).toBeNull();
    });
  });

  describe("cancelation", () => {
    it("matches Monaco's Canceled error", () => {
      expect(classifyReportingNoise(named("Canceled", "Canceled"))).toBe(
        "cancelation",
      );
    });

    it("matches the loader's cancelation object", () => {
      expect(
        classifyReportingNoise({
          type: "cancelation",
          msg: "operation is manually canceled",
        }),
      ).toBe("cancelation");
    });

    it.each([
      named("Canceled", "Request canceled by the user"),
      new Error("Canceled"),
      { type: "cancel" },
      Object.assign(Object.create({ inherited: true }) as object, {
        type: "cancelation",
      }),
    ])("does not match %j", (value) => {
      expect(classifyReportingNoise(value)).toBeNull();
    });
  });

  describe("stale-asset", () => {
    it.each([
      new Error(
        "Failed to execute 'importScripts' on 'WorkerGlobalScope': The script at 'https://logic.seliseblocks.com/assets/editor.worker-abc.js' failed to load.",
      ),
      new TypeError("Object.hasOwn is not a function"),
    ])("matches %s", (error) => {
      expect(classifyReportingNoise(error)).toBe("stale-asset");
    });

    it.each([
      ["Event", new Event("error")],
      ["ErrorEvent", new ErrorEvent("error")],
    ])("matches a bare %s", (_, event) => {
      expect(classifyReportingNoise(event)).toBe("stale-asset");
    });

    it.each(["[object Event]", "[object ErrorEvent]", '{"isTrusted":true}'])(
      "matches the stringified event %s from the payload",
      (message) => {
        expect(
          classifyReportingNoise(
            message,
            tracePayload({ class: "(unknown)", message }, ["(unknown)"]),
          ),
        ).toBe("stale-asset");
      },
    );

    it("does not match other hasOwn failures", () => {
      expect(
        classifyReportingNoise(
          new TypeError("Object.hasOwnProperty is not a function"),
        ),
      ).toBeNull();
    });
  });

  describe("recaptcha-timeout", () => {
    it("matches the reCAPTCHA timeout rejection", () => {
      expect(classifyReportingNoise(new Error("reCAPTCHA Timeout (b)"))).toBe(
        "recaptcha-timeout",
      );
    });

    it("matches a logged message", () => {
      expect(
        classifyReportingNoise("reCAPTCHA Timeout", {
          body: { message: { body: "reCAPTCHA Timeout" } },
        }),
      ).toBe("recaptcha-timeout");
    });

    it("does not match the text elsewhere in a message", () => {
      expect(
        classifyReportingNoise(new Error("Login failed: reCAPTCHA Timeout")),
      ).toBeNull();
    });
  });

  // §7 #7: a genuine bug is reported.
  it("reports anything no rule matches", () => {
    expect(
      classifyReportingNoise(
        new TypeError("Cannot read properties of undefined (reading 'id')"),
        tracePayload(
          {
            class: "TypeError",
            message: "Cannot read properties of undefined (reading 'id')",
          },
          [APP_FRAME],
        ),
      ),
    ).toBeNull();
  });

  // C1: fail open.
  describe("when classification throws", () => {
    const throwing = (key: string) =>
      Object.defineProperty({}, key, {
        get() {
          throw new Error("getter");
        },
      });

    it("reports when a payload getter throws, even for a value that would match", () => {
      expect(
        classifyReportingNoise(
          new TypeError("Failed to fetch"),
          throwing("body") as RollbarPayloadLike,
        ),
      ).toBeNull();
    });

    it("reports when the error's own getter throws", () => {
      expect(classifyReportingNoise(throwing("name"))).toBeNull();
    });

    it("tolerates a cyclic value", () => {
      const cyclic: Record<string, unknown> = { message: "boom" };
      cyclic.self = cyclic;

      expect(classifyReportingNoise(cyclic)).toBeNull();
    });

    it.each<[string, unknown]>([
      ["null frames", { body: { trace: { frames: [null, null] } } }],
      ["a null body", { body: null }],
      ["a null trace chain", { body: { trace_chain: [null] } }],
    ])("tolerates %s", (_, payload) => {
      expect(
        classifyReportingNoise(
          new Error("boom"),
          payload as RollbarPayloadLike,
        ),
      ).toBeNull();
    });

    it.each([null, undefined, 0, "", Symbol("x")])(
      "tolerates the value %s",
      (value) => {
        expect(classifyReportingNoise(value)).toBeNull();
      },
    );
  });

  // C12
  describe("performance", () => {
    afterEach(() => {
      vi.restoreAllMocks();
      vi.unstubAllGlobals();
    });

    it("classifies 1,000 fifty-frame payloads within a second, without timers or I/O", () => {
      const fetchSpy = vi.fn();
      vi.stubGlobal("fetch", fetchSpy);
      const timeoutSpy = vi.spyOn(globalThis, "setTimeout");
      // Every frame an extension frame but the last, so the rule walks the whole stack each time.
      const payload = tracePayload({ class: "Error", message: "boom" }, [
        ...Array.from({ length: 49 }, () => EXTENSION_FRAME),
        APP_FRAME,
      ]);
      const error = new Error("boom");

      const start = performance.now();
      for (let i = 0; i < 1000; i++) classifyReportingNoise(error, payload);
      const elapsed = performance.now() - start;

      expect(elapsed).toBeLessThanOrEqual(1000);
      expect(fetchSpy).not.toHaveBeenCalled();
      expect(timeoutSpy).not.toHaveBeenCalled();
    });
  });
});

describe("isNetworkFailure", () => {
  it("is true only for the network rule", () => {
    expect(isNetworkFailure(new TypeError("Failed to fetch"))).toBe(true);
    expect(isNetworkFailure(domException("AbortError", "aborted"))).toBe(true);
    expect(isNetworkFailure(new Error("reCAPTCHA Timeout (b)"))).toBe(false);
    expect(
      isNetworkFailure(
        domException("InvalidStateError", "Transition was skipped"),
      ),
    ).toBe(false);
    expect(isNetworkFailure(new SyntaxError("Unexpected token <"))).toBe(false);
  });
});
