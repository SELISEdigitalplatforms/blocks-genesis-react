import { QueryClient } from "@tanstack/react-query";
import type Rollbar from "rollbar";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { HttpError } from "@/lib/http/error";
import { initiateService } from "@/services/initiate.service";
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

  afterEach(() => vi.unstubAllGlobals());

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

  // §7 #7, H11
  it("reports a genuine bug once, with the query context", async () => {
    attachQueryErrorReporting(queryClient, rollbar);

    await runQuery(() =>
      Promise.reject(
        new TypeError("Cannot read properties of undefined (reading 'id')"),
      ),
    );

    expect(rollbar.error).toHaveBeenCalledTimes(1);
    expect(rollbar.error).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "TypeError",
        message: "Cannot read properties of undefined (reading 'id')",
      }),
      { source: "react-query", kind: "query", queryHash: '["subject"]' },
    );
  });

  // H3
  it("skips a query that failed on the network", async () => {
    attachQueryErrorReporting(queryClient, rollbar);

    await runQuery(() => Promise.reject(new TypeError("Failed to fetch")));

    expect(rollbar.error).not.toHaveBeenCalled();
  });

  it("skips a mutation whose request was aborted", async () => {
    attachQueryErrorReporting(queryClient, rollbar);

    await runMutation(() =>
      Promise.reject(
        new DOMException("The user aborted a request.", "AbortError"),
      ),
    );

    expect(rollbar.error).not.toHaveBeenCalled();
  });

  describe("with the IAM initiate request", () => {
    const params = { clientId: "c", redirectUri: "r", forwardedTo: "f" };
    const initiate = () =>
      runQuery(() => initiateService.fetchRedirectUrl(params));

    // §7 #4, H5
    it("skips a non-2xx answer", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({ ok: false, status: 400 }),
      );
      attachQueryErrorReporting(queryClient, rollbar);

      await initiate();

      expect(rollbar.error).not.toHaveBeenCalled();
    });

    it("skips a network failure", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockRejectedValue(new TypeError("Failed to fetch")),
      );
      attachQueryErrorReporting(queryClient, rollbar);

      await initiate();

      expect(rollbar.error).not.toHaveBeenCalled();
    });

    // C5: a 200 without the URL is a contract fault, so it is still reported.
    it("reports a response without redirect_uri", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) }),
      );
      attachQueryErrorReporting(queryClient, rollbar);

      await initiate();

      expect(rollbar.error).toHaveBeenCalledTimes(1);
      expect(rollbar.error).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "No redirect_uri in initiate response",
        }),
        expect.objectContaining({ source: "react-query", kind: "query" }),
      );
    });
  });
});
