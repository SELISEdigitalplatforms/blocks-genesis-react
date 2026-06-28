import { PROFILE_ENDPOINTS } from "@/constants/endpoint.constant";
import { iamClient } from "@/lib";
import type { UserDetails } from "@/models";

class UserService {
  getUserInfo(): Promise<UserDetails> {
    return iamClient.get(`${PROFILE_ENDPOINTS.ME}`);
  }
}

export const userService = new UserService();
