import { IAM_ENDPOINTS } from "@/constants/endpoint.constant";
import { iamClient } from "@/lib/http/instances";
import { getRuntimeEnv } from "@/lib/runtime-env";

/** Which page the initiate response should point at. */
export type AuthFlow = "login" | "signup";

export interface LoginStartParams {
  redirectUri: string;
  /** Defaults to `login`, which is sent as no `flow` parameter at all. */
  flow?: AuthFlow;
}

export interface LoginStartResponse {
  redirect_uri?: string;
  /** Echoed by IAM for `flow=signup`. Absent on servers that predate the parameter. */
  flow?: string;
}

class LoginService {
  // One request shape serves both flows — the client, the tenant and the redirect URI
  // are identical, and only the page IAM points back at differs. `flow` is appended
  // only when it is signup, so a login request goes out byte-identical to before.
  startFlow({
    redirectUri,
    flow,
  }: LoginStartParams): Promise<LoginStartResponse> {
    const blocksKey = getRuntimeEnv("BLOCKS_X_BLOCKS_KEY");
    const clientId = getRuntimeEnv("BLOCKS_OIDC_CLIENT_ID");

    const params = new URLSearchParams({
      "x-blocks-key": blocksKey,
      clientId,
      redirectUri,
    });
    if (flow === "signup") params.set("flow", flow);

    const headers: Record<string, string> = {};
    if (blocksKey) headers["X-Blocks-Key"] = blocksKey;

    return iamClient.get<LoginStartResponse>(
      `${IAM_ENDPOINTS.INITIATE}?${params.toString()}`,
      headers,
    );
  }
}

export const loginService = new LoginService();
