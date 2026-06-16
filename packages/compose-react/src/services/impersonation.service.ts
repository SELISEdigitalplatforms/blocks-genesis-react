import { IMPERSONATE_ENDPOINTS } from "@/constants/endpoint.constant";
import { iamClient } from "@/lib/http/instances";
import type {
  ImpersonationRequest,
  ImpersonationState,
  ImpersonationStatusResponse,
} from "@/models/impersonation.model";

class ImpersonationService {
  startImpersonation(
    request: ImpersonationRequest,
  ): Promise<ImpersonationState> {
    return iamClient.post(IMPERSONATE_ENDPOINTS.IMPERSONATE, request);
  }

  stopImpersonation(): Promise<void> {
    return iamClient.post(IMPERSONATE_ENDPOINTS.STOP_IMPERSONATION, {});
  }

  impersonationStatus(): Promise<ImpersonationStatusResponse> {
    return iamClient.post(IMPERSONATE_ENDPOINTS.IMPERSONATION_STATUS, null);
  }
}

export const impersonationService = new ImpersonationService();
