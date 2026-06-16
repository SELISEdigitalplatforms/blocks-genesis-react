import { iamClient } from "@/lib/http/instances";

export class AuthService {
  logout() {
    return iamClient.post("/api/auth/Logout", {});
  }
}

export const authService = new AuthService();
