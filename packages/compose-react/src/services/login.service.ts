import { IAM_ENDPOINTS } from "@/constants/endpoint.constant";
import { iamClient } from "@/lib/http/instances";
import { getRuntimeEnv } from "@/lib/runtime-env";

export interface LoginStartParams {
  redirectUri: string;
}

export interface LoginStartResponse {
  redirect_uri?: string;
}

class LoginService {
  startLogin({ redirectUri }: LoginStartParams): Promise<LoginStartResponse> {
    const blocksKey = getRuntimeEnv("BLOCKS_X_BLOCKS_KEY");
    const clientId = getRuntimeEnv("BLOCKS_OIDC_CLIENT_ID");

    const params = new URLSearchParams({
      "x-blocks-key": blocksKey,
      clientId,
      redirectUri,
    });
    const headers: Record<string, string> = {};
    if (blocksKey) headers["X-Blocks-Key"] = blocksKey;

    return iamClient.get<LoginStartResponse>(
      `${IAM_ENDPOINTS.INITIATE}?${params.toString()}`,
      headers,
    );
  }
}

export const loginService = new LoginService();
