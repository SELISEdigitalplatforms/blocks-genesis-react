import type { BaseUser } from "../types/auth";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthStoreState {
  isAuthenticated: boolean;
  user: BaseUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  setUser: (user: BaseUser | null) => void;
  setAuthenticated: () => void;
  setUnAuthenticated: () => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  clearTokens: () => void;
  reset: () => void;
}

export const useAuthStore = create<AuthStoreState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      accessToken: null,
      refreshToken: null,
      setUser: (user) => {
        set((state) => ({ ...state, user }));
      },
      setAuthenticated: () => {
        set((state) => ({ ...state, isAuthenticated: true }));
      },
      setUnAuthenticated: () => {
        set((state) => ({ ...state, isAuthenticated: false, user: null }));
      },
      setTokens: (accessToken: string, refreshToken: string) => {
        set((state) => ({ ...state, accessToken, refreshToken }));
      },
      clearTokens: () => {
        set((state) => ({ ...state, accessToken: null, refreshToken: null }));
      },
      reset: () => {
        set({
          isAuthenticated: false,
          user: null,
          accessToken: null,
          refreshToken: null,
        });
      },
    }),
    {
      name: "auth-storage",
    },
  ),
);
