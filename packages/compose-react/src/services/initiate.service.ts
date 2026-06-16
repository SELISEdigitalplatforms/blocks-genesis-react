import { IAM_ENDPOINTS } from "@/constants/endpoint.constant";
import { getRuntimeEnv } from "@/lib";

export interface InitiateParams {
  clientId: string;
  redirectUri: string;
  forwardedTo: string;
}

class InitiateService {
  async fetchRedirectUrl({
    clientId,
    redirectUri,
    forwardedTo,
  }: InitiateParams): Promise<string> {
    const blocksKey = getRuntimeEnv("BLOCKS_X_BLOCKS_KEY");
    const iamBaseUrl = getRuntimeEnv("userBaseUrl");

    const params = new URLSearchParams({
      "x-blocks-key": blocksKey,
      clientId,
      redirectUri,
      forwardedTo,
    });
    const headers: Record<string, string> = { Accept: "application/json" };
    if (blocksKey) headers["X-Blocks-Key"] = blocksKey;

    const response = await fetch(
      `${iamBaseUrl}${IAM_ENDPOINTS.INITIATE}?${params}`,
      { headers },
    );

    if (!response.ok) {
      throw new Error(`Initiate request failed — HTTP ${response.status}`);
    }

    const data = await response.json();
    if (!data.redirect_uri)
      throw new Error("No redirect_uri in initiate response");

    return data.redirect_uri as string;
  }
}

export const initiateService = new InitiateService();
