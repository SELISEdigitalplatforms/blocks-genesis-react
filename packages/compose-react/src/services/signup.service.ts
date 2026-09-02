import { ORGANIZATION_ENDPOINTS } from "@/constants/endpoint.constant";
import { iamClient } from "@/lib/http/instances";
import type { GetSignUpSettingResponse } from "@/models/signup.model";

class SignUpService {
  // Anonymous on the IAM side — the tenant is resolved from the X-Blocks-Key
  // header, which `iamClient` already attaches. That is what lets the login
  // page ask whether signup is open before anyone has authenticated.
  getSignUpSetting(): Promise<GetSignUpSettingResponse> {
    return iamClient.get<GetSignUpSettingResponse>(
      ORGANIZATION_ENDPOINTS.GET_SIGNUP_SETTING,
    );
  }
}

export const signUpService = new SignUpService();
