import type Rollbar from "rollbar";
import { describe, expect, it, vi } from "vitest";
import { HttpError } from "@/lib/http/error";
import type { HttpRequestFailure } from "@/lib/http/types";
import { createHttpFailureReporter } from "./report-http-errors";

const failure = (
  overrides: Partial<HttpRequestFailure> = {},
): HttpRequestFailure => ({
  error: new TypeError("Failed to fetch"),
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

  it("reports a request that never reached the server", () => {
    const rollbar = rollbarStub();

    createHttpFailureReporter(rollbar)(failure());

    expect(rollbar.error).toHaveBeenCalledWith(
      expect.any(TypeError),
      expect.objectContaining({
        source: "http-client",
        url: "https://api.example.com/api/Project/Gets",
        method: "GET",
      }),
    );
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
