import type Rollbar from "rollbar";
import { describe, expect, it, vi } from "vitest";
import { HttpError } from "@/lib/http/error";
import type { HttpRequestFailure } from "@/lib/http/types";
import { createHttpFailureReporter } from "./report-http-errors";

const failure = (
  overrides: Partial<HttpRequestFailure> = {},
): HttpRequestFailure => ({
  error: new SyntaxError("Unexpected token < in JSON"),
  normalized: new HttpError(500, {
    errors: { general: "Something went wrong" },
  }),
  url: "https://api.example.com/api/Project/Gets",
  method: "GET",
  transport: true,
  ...overrides,
});

describe("createHttpFailureReporter", () => {
  const rollbarStub = () => ({ error: vi.fn() }) as unknown as Rollbar;

  // §7 #3, H12: a transport failure that is not the browser's own network error is a client fault.
  it("reports a transport failure that is not a network failure", () => {
    const rollbar = rollbarStub();

    createHttpFailureReporter(rollbar)(failure());

    expect(rollbar.error).toHaveBeenCalledTimes(1);
    expect(rollbar.error).toHaveBeenCalledWith(
      expect.any(SyntaxError),
      expect.objectContaining({
        source: "http-client",
        url: "https://api.example.com/api/Project/Gets",
        method: "GET",
      }),
    );
  });

  // §7 #2, H2
  it.each([
    new TypeError("Failed to fetch"),
    new TypeError("Failed to fetch (api.example.com)"),
    new TypeError("NetworkError when attempting to fetch resource."),
    new TypeError("Load failed"),
    new DOMException("signal is aborted without reason", "AbortError"),
  ])("skips the browser network failure %s", (error) => {
    const rollbar = rollbarStub();

    createHttpFailureReporter(rollbar)(failure({ error }));

    expect(rollbar.error).not.toHaveBeenCalled();
  });

  it.each([400, 401, 403, 404, 409, 500, 502])(
    "leaves a %i to the server and the UI",
    (status) => {
      const rollbar = rollbarStub();

      createHttpFailureReporter(rollbar)(
        failure({
          transport: false,
          error: new HttpError(status, { errors: { general: "nope" } }),
        }),
      );

      expect(rollbar.error).not.toHaveBeenCalled();
    },
  );

  it("still reports when the thrown value was not an Error", () => {
    const rollbar = rollbarStub();

    createHttpFailureReporter(rollbar)(failure({ error: "socket hang up" }));

    expect(rollbar.error).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({ source: "http-client" }),
    );
  });
});
