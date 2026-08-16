import { getRuntimeEnv } from "@/lib/runtime-env";
import type { ImpersonationStatusResponse } from "@/models/impersonation.model";
import { impersonationService } from "@/services/impersonation.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const IMPERSONATION_STATUS_QUERY_KEY = ["blocks-kit-impersonation", "status"];

const buildStoppedStatus = (): ImpersonationStatusResponse => ({
  impersonated: false,
  originalTenantId: getRuntimeEnv("BLOCKS_X_BLOCKS_KEY") || "",
  impersonatedTenantId: null,
});

export const useImpersonationStatusChecker = () => {
  return useQuery({
    queryKey: IMPERSONATION_STATUS_QUERY_KEY,
    queryFn: () => impersonationService.impersonationStatus(),
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: "always",
  });
};

export const useStopImpersonation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["impersonation", "stop"],
    mutationFn: impersonationService.stopImpersonation,
    onSettled: () => {
      queryClient.setQueryData<ImpersonationStatusResponse>(
        IMPERSONATION_STATUS_QUERY_KEY,
        buildStoppedStatus(),
      );
    },
  });
};

export const useStartImpersonation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["impersonation", "start"],
    mutationFn: impersonationService.startImpersonation,
    onSuccess: (_data, variables) => {
      queryClient.setQueryData<ImpersonationStatusResponse>(
        IMPERSONATION_STATUS_QUERY_KEY,
        (current) => ({
          impersonated: true,
          originalTenantId:
            current?.originalTenantId ||
            getRuntimeEnv("BLOCKS_X_BLOCKS_KEY") ||
            "",
          impersonatedTenantId: variables.targeted_tenant_id,
        }),
      );
    },
  });
};
