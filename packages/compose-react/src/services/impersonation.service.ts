import { iamClient } from "@/lib/http";

export interface ImpersonationRequest {
  targeted_tenant_id: string;
  orgId?: string;
  organizationId?: string;
}

export interface ImpersonationState {
  rootTenantId: string;
  targeted_tenant_id: string;
  orgId: string;
  startedAtUtc: string;
}

export interface ImpersonationStatusResponse {
  impersonated: boolean;
  originalTenantId: string;
  impersonatedTenantId: string | null;
}

const AUTH_SUBPATH = "/auth";
const IMPERSONATE_ENDPOINTS = {
  IMPERSONATE: `/api${AUTH_SUBPATH}/impersonate`,
  STOP_IMPERSONATION: `/api${AUTH_SUBPATH}/impersonation/stop`,
  IMPERSONATION_STATUS: `/api${AUTH_SUBPATH}/impersonation/status`,
} as const;

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
