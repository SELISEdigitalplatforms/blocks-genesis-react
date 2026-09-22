import { HttpError } from "@/lib/http/error";
import { getRuntimeEnv } from "@/lib/runtime-env";
import { claimTenant } from "@/lib/tenant-ownership";
import type {
  ImpersonationRequest,
  ImpersonationStatusResponse,
  StartImpersonationResponse,
} from "@/models/impersonation.model";
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
    onSuccess: () => {
      queryClient.setQueryData<ImpersonationStatusResponse>(
        IMPERSONATION_STATUS_QUERY_KEY,
        buildStoppedStatus(),
      );
    },
    // This used to be `onSettled`, which recorded "stopped" for failures too. A stop that 500s or
    // never leaves the browser leaves the session impersonated server-side, so writing the stopped
    // status there put the client into a state the server did not share -- the UI left the project
    // while the cookie stayed pointed at it.
    //
    // 401 is the one failure that still means stopped: IAM answers it when the refresh token names
    // no live impersonated session, so there is nothing left to stop either way. Every other failure
    // is unknown, and unknown is resolved by asking the server rather than by guessing.
    onError: (error: unknown) => {
      if (error instanceof HttpError && error.status === 401) {
        queryClient.setQueryData<ImpersonationStatusResponse>(
          IMPERSONATION_STATUS_QUERY_KEY,
          buildStoppedStatus(),
        );
        return;
      }

      void queryClient.invalidateQueries({
        queryKey: IMPERSONATION_STATUS_QUERY_KEY,
      });
    },
  });
};

/**
 * Starts (or retargets) impersonation.
 *
 * A 200 whose `cookie_set` is not true is treated as a failure, because it is one: the browser
 * authenticates with the HttpOnly cookie and ignores body tokens, so such a response leaves the
 * previous cookie in place. Recording "impersonated" for it used to make the client render a
 * project under whatever tenant the unchanged cookie still pointed at.
 */
const startImpersonation = async (
  request: ImpersonationRequest,
): Promise<StartImpersonationResponse> => {
  const result = await impersonationService.startImpersonation(request);

  if (result?.cookie_set !== true) {
    throw new HttpError(500, {
      errors: {
        general:
          "Impersonation did not replace the session cookie (cookie_set was not true)",
      },
    });
  }

  return result;
};

export const useStartImpersonation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["impersonation", "start"],
    mutationFn: startImpersonation,
    onSuccess: (_data, variables) => {
      // Claimed here rather than at each call site. The access cookie is named after the application
      // domain alone, so every tab on this origin shares one token and the tab that impersonated last
      // owns it; a tab that is visible but not focused keeps polling under it none the wiser. The
      // claim used to live only in the route guard, which the environment cards -- the main way into a
      // project, in both this package and blocks-os -- do not go through, so entering a project from a
      // card silently repointed every other tab's cookie without telling them.
      claimTenant(variables.targeted_tenant_id);

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
    onError: () => {
      // The cookie's tenant is now unknown: the call may have failed before, during or after the
      // server swapped it. Refetch rather than leave a stale claim standing.
      void queryClient.invalidateQueries({
        queryKey: IMPERSONATION_STATUS_QUERY_KEY,
      });
    },
  });
};
