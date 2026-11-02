import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const h = vi.hoisted(() => ({ env: {} as Record<string, string> }));
vi.mock("@/lib", () => ({ getRuntimeEnv: (key: string) => h.env[key] ?? "" }));

import { HttpError } from "@/lib/http/error";
import { initiateService } from "@/services/initiate.service";

const params = { clientId: "c", redirectUri: "r", forwardedTo: "f" };

beforeEach(() => {
  h.env = { BLOCKS_X_BLOCKS_KEY: "key", userBaseUrl: "https://iam.test" };
});
afterEach(() => vi.unstubAllGlobals());

describe("InitiateService.fetchRedirectUrl", () => {
  it("returns the redirect_uri on a successful response", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ redirect_uri: "https://go.test" }),
    });
    vi.stubGlobal("fetch", fetchMock);
    await expect(initiateService.fetchRedirectUrl(params)).resolves.toBe(
      "https://go.test",
    );
    expect(fetchMock.mock.calls[0]?.[0]).toContain("https://iam.test");
  });

  it("throws on a non-ok response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 500 }),
    );
    await expect(initiateService.fetchRedirectUrl(params)).rejects.toThrow(
      /HTTP 500/,
    );
  });

  // §7 #4, H5: an HttpError, so the query reporter leaves it to IAM.
  it("rejects a non-ok response with an HttpError carrying the status", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 400 }),
    );
    const error: unknown = await initiateService
      .fetchRedirectUrl(params)
      .catch((e: unknown) => e);

    expect(error).toBeInstanceOf(HttpError);
    expect(error).toMatchObject({
      status: 400,
      errors: { general: "Initiate request failed — HTTP 400" },
    });
  });

  // C5: a contract fault, not an HTTP outcome, so it stays a plain Error and is reported.
  it("throws when the response has no redirect_uri", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) }),
    );
    const error: unknown = await initiateService
      .fetchRedirectUrl(params)
      .catch((e: unknown) => e);

    expect(error).toBeInstanceOf(Error);
    expect(error).not.toBeInstanceOf(HttpError);
    expect((error as Error).message).toBe(
      "No redirect_uri in initiate response",
    );
  });

  it("lets a network failure propagate as the browser's own error", async () => {
    const networkError = new TypeError("Failed to fetch");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(networkError));

    await expect(initiateService.fetchRedirectUrl(params)).rejects.toBe(
      networkError,
    );
  });

  it("omits the blocks-key header when the key is absent", async () => {
    h.env = { userBaseUrl: "https://iam.test" };
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ redirect_uri: "https://go.test" }),
    });
    vi.stubGlobal("fetch", fetchMock);
    await initiateService.fetchRedirectUrl(params);
    const headers = fetchMock.mock.calls[0]?.[1].headers;
    expect(headers["X-Blocks-Key"]).toBeUndefined();
  });
});
