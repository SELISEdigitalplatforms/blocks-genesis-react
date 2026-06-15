import { HttpClient } from "@/lib/http";

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

class ImpersonationService {
  startImpersonation(request: ImpersonationRequest): Promise<ImpersonationState> {
    const http = new HttpClient({
      baseURL: window?.process?.env?.BLOCKS_API_BASE_URL || "",
      blocksKey: window?.process?.env?.BLOCKS_X_BLOCKS_KEY,
    });

    const AUTH_SUBPATH = "/auth";
    const IMPERSONATE_ENDPOINTS = {
      IMPERSONATE: `${window.process?.env.userBaseUrl}/api${AUTH_SUBPATH}/impersonate`,
      STOP_IMPERSONATION: `${window.process?.env.userBaseUrl}/api${AUTH_SUBPATH}/impersonation/stop`,
      IMPERSONATION_STATUS: `${window.process?.env.userBaseUrl}/api${AUTH_SUBPATH}/impersonation/status`,
    } as const;
    return http.post(`${IMPERSONATE_ENDPOINTS.IMPERSONATE}`, request, undefined, {
      absoluteUrl: true,
    });
  }

  stopImpersonation(): Promise<void> {
    const http = new HttpClient({
      baseURL: window?.process?.env?.BLOCKS_API_BASE_URL || "",
      blocksKey: window?.process?.env?.BLOCKS_X_BLOCKS_KEY,
    });

    const AUTH_SUBPATH = "/auth";
    const IMPERSONATE_ENDPOINTS = {
      IMPERSONATE: `${window.process?.env.userBaseUrl}/api${AUTH_SUBPATH}/impersonate`,
      STOP_IMPERSONATION: `${window.process?.env.userBaseUrl}/api${AUTH_SUBPATH}/impersonation/stop`,
      IMPERSONATION_STATUS: `${window.process?.env.userBaseUrl}/api${AUTH_SUBPATH}/impersonation/status`,
    } as const;
    return http.post(`${IMPERSONATE_ENDPOINTS.STOP_IMPERSONATION}`, {}, undefined, {
      absoluteUrl: true,
    });
  }

  impersonationStatus(): Promise<ImpersonationStatusResponse> {
    const http = new HttpClient({
      baseURL: window?.process?.env?.BLOCKS_API_BASE_URL || "",
      blocksKey: window?.process?.env?.BLOCKS_X_BLOCKS_KEY,
    });

    const AUTH_SUBPATH = "/auth";
    const IMPERSONATE_ENDPOINTS = {
      IMPERSONATE: `${window.process?.env.userBaseUrl}/api${AUTH_SUBPATH}/impersonate`,
      STOP_IMPERSONATION: `${window.process?.env.userBaseUrl}/api${AUTH_SUBPATH}/impersonation/stop`,
      IMPERSONATION_STATUS: `${window.process?.env.userBaseUrl}/api${AUTH_SUBPATH}/impersonation/status`,
    } as const;
    return http.post(`${IMPERSONATE_ENDPOINTS.IMPERSONATION_STATUS}`, null, undefined, {
      absoluteUrl: true,
    });
  }
}

export const impersonationService = new ImpersonationService();
