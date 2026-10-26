import { IMPERSONATE_ENDPOINTS } from "@/constants/endpoint.constant";
import { iamClient } from "@/lib/http/instances";
import type { HttpClientOptions } from "@/lib/http/types";
import type {
  ImpersonationRequest,
  ImpersonationStatusResponse,
  StartImpersonationResponse,
} from "@/models/impersonation.model";

class ImpersonationService {
  startImpersonation(
    request: ImpersonationRequest,
    options?: HttpClientOptions,
  ): Promise<StartImpersonationResponse> {
    return iamClient.post(
      IMPERSONATE_ENDPOINTS.IMPERSONATE,
      request,
      undefined,
      options,
    );
  }

  stopImpersonation(options?: HttpClientOptions): Promise<void> {
    return iamClient.post(
      IMPERSONATE_ENDPOINTS.STOP_IMPERSONATION,
      {},
      undefined,
      options,
    );
  }

  impersonationStatus(
    options?: HttpClientOptions,
  ): Promise<ImpersonationStatusResponse> {
    return iamClient.post(
      IMPERSONATE_ENDPOINTS.IMPERSONATION_STATUS,
      null,
      undefined,
      options,
    );
  }
}

export const impersonationService = new ImpersonationService();
