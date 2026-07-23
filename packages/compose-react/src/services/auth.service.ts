import { AUTH_ENDPOINTS } from "@/constants/endpoint.constant";
import { iamClient } from "@/lib/http/instances";

export class AuthService {
  logout() {
    return iamClient.post(AUTH_ENDPOINTS.LOGOUT, {});
  }
}

export const authService = new AuthService();
