import { iamClient } from "@/lib/http";

export class AuthService {
  logout() {
    return iamClient.post("/api/auth/Logout", {});
  }
}

export const authService = new AuthService();
