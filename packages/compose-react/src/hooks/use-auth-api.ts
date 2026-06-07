import { useMutation, useQuery } from "@tanstack/react-query";
import { authService } from "@/services/auth.service";
import { impersonationService } from "@/services/impersonation.service";

export const useLogout = () => {
  return useMutation({
    mutationKey: ["logout"],
    mutationFn: authService.logout,
  });
};

export const useImpersonationStatusChecker = () => {
  return useQuery({
    queryKey: ["impersonation", "status"],
    queryFn: () => impersonationService.impersonationStatus(),
  });
};

export const useStopImpersonation = () => {
  return useMutation({
    mutationKey: ["impersonation", "stop"],
    mutationFn: impersonationService.stopImpersonation,
  });
};

export const useStartImpersonation = () => {
  return useMutation({
    mutationKey: ["impersonation", "start"],
    mutationFn: impersonationService.startImpersonation,
  });
};
