import { clearTenantClaims } from "@/lib/tenant-ownership";
import { authService } from "@/services/auth.service";
import { useMutation } from "@tanstack/react-query";

export const useLogout = () => {
  return useMutation({
    mutationKey: ["logout"],
    mutationFn: authService.logout,
    // Done here rather than in each logout control, so every way out of the app clears it.
    onSuccess: () => clearTenantClaims(),
  });
};
