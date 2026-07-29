import { describe, it, expect, vi, beforeEach } from "vitest";

const c = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock("@/lib/http/instances", () => ({ iamClient: c }));

const h = vi.hoisted(() => ({ env: {} as Record<string, string> }));
vi.mock("@/lib", () => ({ getRuntimeEnv: (key: string) => h.env[key] ?? "" }));
vi.mock("@/lib/runtime-env", () => ({
  getRuntimeEnv: (key: string) => h.env[key] ?? "",
}));

import { loginService } from "@/services/login.service";
import { IAM_ENDPOINTS } from "@/constants/endpoint.constant";

beforeEach(() => {
  c.get.mockReset().mockResolvedValue({});
  h.env = {
    BLOCKS_X_BLOCKS_KEY: "key",
    BLOCKS_OIDC_CLIENT_ID: "cid",
  };
});

describe("LoginService.startLogin", () => {
  it("calls the initiate endpoint with the redirect uri, client id and blocks key", async () => {
    await loginService.startLogin({ redirectUri: "https://app/cb" });

    const [url, headers] = c.get.mock.calls[0] ?? [];
    expect(url).toContain(IAM_ENDPOINTS.INITIATE);
    expect(url).toContain("clientId=cid");
    expect(url).toContain("redirectUri=https%3A%2F%2Fapp%2Fcb");
    expect(url).toContain("x-blocks-key=key");
    expect(headers).toEqual({ "X-Blocks-Key": "key" });
  });

  it("omits the X-Blocks-Key header when the key is missing", async () => {
    h.env = { BLOCKS_OIDC_CLIENT_ID: "cid" };

    await loginService.startLogin({ redirectUri: "https://app/cb" });

    const headers = c.get.mock.calls[0]?.[1];
    expect(headers).toEqual({});
  });

  it("returns the parsed initiate payload", async () => {
    c.get.mockResolvedValue({ redirect_uri: "https://idp/go" });

    await expect(
      loginService.startLogin({ redirectUri: "https://app/cb" }),
    ).resolves.toEqual({ redirect_uri: "https://idp/go" });
  });
});
