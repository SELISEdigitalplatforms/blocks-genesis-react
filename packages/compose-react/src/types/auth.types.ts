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

export type ComposeUser = BaseUser;

export interface AuthStateShape {
  isAuthenticated: boolean;
  user: ComposeUser | null;
  accessToken: string | null;
  refreshToken: string | null;
}
