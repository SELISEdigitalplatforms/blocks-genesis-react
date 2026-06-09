import { HttpClient } from "@seliseblocks/blocks-kit-core/http";

export class AuthService {
  logout() {
    const http = new HttpClient({
      baseURL: window?.process?.env?.BLOCKS_API_BASE_URL || "",
      blocksKey: window?.process?.env?.BLOCKS_X_BLOCKS_KEY,
    });

    const userBaseUrl = window.process?.env["userBaseUrl"] || "";
    return http.post(`${userBaseUrl}/api/auth/Logout`, {}, undefined, {
      absoluteUrl: true,
    });
  }
}

export const authService = new AuthService();
