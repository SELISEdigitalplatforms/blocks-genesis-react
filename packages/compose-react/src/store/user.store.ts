import type { UserDetails } from "@/models";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UserStoreState {
  userDetails: UserDetails | null;
  setUserDetails: (userDetails: UserDetails | null) => void;
  resetUserStore: () => void;
}

export const useUserStore = create<UserStoreState>()(
  persist(
    (set) => ({
      userDetails: null,
      setUserDetails: (userDetails) => {
        set((state) => ({ ...state, userDetails }));
      },
      resetUserStore: () => {
        set({
          userDetails: null,
        });
      },
    }),
    {
      name: "user-storage",
    },
  ),
);
