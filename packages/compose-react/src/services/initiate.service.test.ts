import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const h = vi.hoisted(() => ({ env: {} as Record<string, string> }));
vi.mock("@/lib", () => ({ getRuntimeEnv: (key: string) => h.env[key] ?? "" }));

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

  it("throws when the response has no redirect_uri", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) }),
    );
    await expect(initiateService.fetchRedirectUrl(params)).rejects.toThrow(
      /No redirect_uri/,
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
