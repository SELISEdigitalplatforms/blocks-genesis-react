import type { BaseUser } from "./user.model";

export interface AuthTokenPair {
  accessToken: string;
  refreshToken: string;
}

type ComposeUser = BaseUser;

export interface AuthStateShape {
  isAuthenticated: boolean;
  user: ComposeUser | null;
  accessToken: string | null;
  refreshToken: string | null;
}
