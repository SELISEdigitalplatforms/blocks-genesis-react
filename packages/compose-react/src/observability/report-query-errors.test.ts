import { QueryClient } from "@tanstack/react-query";
import type Rollbar from "rollbar";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { HttpError } from "@/lib/http/error";
import { attachQueryErrorReporting } from "./report-query-errors";

describe("attachQueryErrorReporting", () => {
  let queryClient: QueryClient;
  let rollbar: Rollbar;

  const runQuery = (queryFn: () => Promise<unknown>) =>
    queryClient
      .fetchQuery({ queryKey: ["subject"], queryFn })
      .catch(() => undefined);

  const runMutation = (mutationFn: () => Promise<unknown>) =>
    queryClient
      .getMutationCache()
      .build(queryClient, { mutationKey: ["subject"], mutationFn })
      .execute(undefined)
      .catch(() => undefined);

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    rollbar = { error: vi.fn() } as unknown as Rollbar;
  });

  it("reports a bug thrown inside a query function", async () => {
    attachQueryErrorReporting(queryClient, rollbar);

    await runQuery(() =>
      Promise.reject(new TypeError("Cannot read properties of undefined")),
    );

    expect(rollbar.error).toHaveBeenCalledWith(
      expect.any(TypeError),
      expect.objectContaining({ source: "react-query", kind: "query" }),
    );
  });

  it("reports a bug thrown inside a mutation function", async () => {
    attachQueryErrorReporting(queryClient, rollbar);

    await runMutation(() => Promise.reject(new TypeError("boom")));

    expect(rollbar.error).toHaveBeenCalledWith(
      expect.any(TypeError),
      expect.objectContaining({ kind: "mutation", mutationKey: ["subject"] }),
    );
  });

  it("skips HttpError, which the http client already reported or the server did", async () => {
    attachQueryErrorReporting(queryClient, rollbar);

    await runQuery(() =>
      Promise.reject(new HttpError(500, { errors: { general: "nope" } })),
    );

    expect(rollbar.error).not.toHaveBeenCalled();
  });

  it("skips anything else carrying a numeric status", async () => {
    attachQueryErrorReporting(queryClient, rollbar);

    await runQuery(() =>
      Promise.reject(Object.assign(new Error("nope"), { status: 404 })),
    );

    expect(rollbar.error).not.toHaveBeenCalled();
  });

  it("stops reporting once unsubscribed", async () => {
    attachQueryErrorReporting(queryClient, rollbar)();

    await runQuery(() => Promise.reject(new TypeError("boom")));

    expect(rollbar.error).not.toHaveBeenCalled();
  });
});
