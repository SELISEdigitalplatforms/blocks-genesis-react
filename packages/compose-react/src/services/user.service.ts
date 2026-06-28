import { PROFILE_ENDPOINTS } from "@/constants/endpoint.constant";
import { iamClient } from "@/lib";
import type { UserDetails } from "@/models";
import type { ApiResponse } from "@/types";

class UserService {
  async getUserInfo(): Promise<ApiResponse<UserDetails>> {
    return iamClient.get(`${PROFILE_ENDPOINTS.ME}`);
  }
}

export const userService = new UserService();
