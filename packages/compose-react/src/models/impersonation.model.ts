export interface ImpersonationState {
  isImpersonated: boolean;
  impersonatedTenantId: string | null;
  originalTenantId: string | null;
}

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

/**
 * What `POST /api/auth/impersonate` actually returns.
 *
 * `cookie_set` is the field that decides whether impersonation took effect *for this browser*. IAM
 * answers 200 with `cookie_set: false` and the tokens in the body when it cannot write the cookie --
 * an unresolved application domain, for instance. Since the HTTP client authenticates with the
 * HttpOnly cookie and never with body tokens, that response leaves the previous (root, or previous
 * project) cookie in place: a 200 that changed nothing.
 */
export interface StartImpersonationResponse {
  cookie_set: boolean;
  impersonation_mode?: boolean;
  impersonation_session_id?: string;
  token_type?: string;
  expires_in?: number;
}
