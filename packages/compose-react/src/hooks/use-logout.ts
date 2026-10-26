import { announceSignOut, clearTenantClaims } from "@/lib/tenant-ownership";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";
import { useProjectStore } from "@/store/project.store";
import { useMutation } from "@tanstack/react-query";
import { useCallback } from "react";

/** Local clean-up for any sign-out: other tabs are told, and no claim outlives the session. */
const forgetSession = (): void => {
  clearTenantClaims();
  announceSignOut();
};

export const useLogout = () => {
  return useMutation({
    mutationKey: ["logout"],
    mutationFn: authService.logout,
    // Done here rather than in each logout control, so every way out of the app clears it.
    onSuccess: forgetSession,
  });
};

/**
 * Signs out from a screen the user cannot otherwise leave, such as a session that cannot be
 * returned to the console. Unlike the Logout button it leaves even when IAM refuses the logout
 * call, which a session that has already ended does.
 */
export const useSignOut = () =>
  useCallback(() => {
    void authService
      .logout()
      .catch(() => undefined)
      .finally(() => {
        forgetSession();
        useProjectStore.getState().resetProjectStore();
        useAuthStore.getState().resetAuthStore();
        window.location.replace(`${window.location.origin}/login`);
      });
  }, []);
