export interface AuthTokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface BaseUser {
  id?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  [key: string]: unknown;
}

export interface ImpersonationState {
  isImpersonated: boolean;
  impersonatedTenantId: string | null;
  originalTenantId: string | null;
}
