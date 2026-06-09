import type { BaseUser } from "@seliseblocks/blocks-kit-core";

export type ComposeUser = BaseUser;

export interface AuthStateShape {
  isAuthenticated: boolean;
  user: ComposeUser | null;
  accessToken: string | null;
  refreshToken: string | null;
}
