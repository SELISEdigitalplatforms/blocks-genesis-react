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
    // Do not run the global 401 → refresh → logout flow for stop. A 401 here
    // usually means impersonation is already ended server-side while the
    // session cookie is still valid for other endpoints (me/status).
    return iamClient.post(
      IMPERSONATE_ENDPOINTS.STOP_IMPERSONATION,
      {},
      undefined,
      { skipTokenRotation: true },
    );
  }

  impersonationStatus(): Promise<ImpersonationStatusResponse> {
    return iamClient.post(IMPERSONATE_ENDPOINTS.IMPERSONATION_STATUS, null);
  }
}

export const impersonationService = new ImpersonationService();
