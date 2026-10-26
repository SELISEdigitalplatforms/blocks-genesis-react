import { HttpClient } from "@/lib/http/client";
import { HttpError } from "@/lib/http/error";
import { iamClient } from "@/lib/http/instances";
import { getRuntimeEnv } from "@/lib/runtime-env";
import { claimTenant } from "@/lib/tenant-ownership";
import type {
  ImpersonationRequest,
  ImpersonationStatusResponse,
  StartImpersonationResponse,
} from "@/models/impersonation.model";
import { impersonationService } from "@/services/impersonation.service";
import { useImpersonateStore } from "@/store/impersonate.store";
import {
  focusManager,
  type Query,
  type QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useCallback, useEffect } from "react";

const IMPERSONATION_STATUS_QUERY_KEY = ["blocks-kit-impersonation", "status"];

/**
 * Options for calls made while holding the session lock: the client's own refresh would wait for
 * that lock, so a call that needs a fresh token goes through `withRefreshedToken` instead.
 */
const INSIDE_SESSION_LOCK = {
  skipTokenRotation: true,
  skipSessionCheck: true,
} as const;

/** How long a returning tab waits for the status before refetching its data anyway. */
const RETURN_STATUS_WAIT_MS = 5_000;

/**
 * Gives React a moment to apply a status that moved the tenant -- the guards stop rendering the
 * page -- before the returning tab refetches what is still on screen.
 */
const FOCUS_REFETCH_DELAY_MS = 50;

const rootTenantId = (): string => getRuntimeEnv("BLOCKS_X_BLOCKS_KEY") || "";

const buildStoppedStatus = (): ImpersonationStatusResponse => ({
  impersonated: false,
  originalTenantId: rootTenantId(),
  impersonatedTenantId: null,
});

const isSameTenant = (
  a: string | null | undefined,
  b: string | null | undefined,
): boolean => !!a && !!b && a.toLowerCase() === b.toLowerCase();

/** The tenant a status answer puts the session cookie in. */
const tenantOfStatus = (
  status: ImpersonationStatusResponse | null | undefined,
): string | null => {
  if (!status) return null;
  return status.impersonated
    ? (status.impersonatedTenantId ?? null)
    : rootTenantId() || null;
};

/** The tenant the guards are rendering for, or null before the first status has arrived. */
const tenantShown = (): string | null => {
  const { isInitialized, isImpersonated, impersonatedTenantId } =
    useImpersonateStore.getState();
  if (!isInitialized) return null;
  return isImpersonated ? impersonatedTenantId : rootTenantId() || null;
};

/** IAM's own refusals carry an error code; a bare 401 is the access token having expired. */
const errorCodeOf = (error: unknown): string | null => {
  if (!(error instanceof HttpError)) return null;
  const code = error.errors?.error;
  return typeof code === "string" ? code : null;
};

const isExpiredAccessToken = (error: unknown): boolean =>
  error instanceof HttpError && error.status === 401 && !errorCodeOf(error);

/**
 * Makes `call` once more after refreshing the token, if it failed only because the access token had
 * expired. For use inside the session lock, where the client's own refresh would wait on the lock.
 */
const withRefreshedToken = async <T>(call: () => Promise<T>): Promise<T> => {
  try {
    return await call();
  } catch (error) {
    if (!isExpiredAccessToken(error)) throw error;
    await iamClient.refreshWithinSessionLock();
    return call();
  }
};

const isStatusQuery = (query: Query): boolean =>
  query.queryKey[0] === IMPERSONATION_STATUS_QUERY_KEY[0];

/**
 * Drops what was cached for the tenant the page was showing, after the session turned out to be
 * in another one. Anything fetched in between went out under the other tenant's token, and the
 * cache would serve it under this page's keys when the page is back in its own tenant. Active
 * queries are left until the guards have stopped rendering them.
 */
const dropDataFromBeforeTheMove = (queryClient: QueryClient): void => {
  void queryClient.cancelQueries({ predicate: (q) => !isStatusQuery(q) });
  setTimeout(() => {
    queryClient.removeQueries({
      predicate: (q) => !isStatusQuery(q),
      type: "inactive",
    });
    void queryClient.invalidateQueries({
      predicate: (q) => !isStatusQuery(q),
      refetchType: "none",
    });
  }, FOCUS_REFETCH_DELAY_MS);
};

/**
 * Records a status read from the server and, when it puts the session in a tenant other than the
 * one being shown, drops that tenant's cached data. Returns the tenant the session is in.
 */
const applyServerStatus = (
  queryClient: QueryClient,
  status: ImpersonationStatusResponse,
): string | null => {
  const shown = tenantShown();
  queryClient.setQueryData(IMPERSONATION_STATUS_QUERY_KEY, status);
  const actual = tenantOfStatus(status);
  if (shown && actual && !isSameTenant(shown, actual)) {
    dropDataFromBeforeTheMove(queryClient);
  }
  return actual;
};

export const useImpersonationStatusChecker = () => {
  return useQuery({
    queryKey: IMPERSONATION_STATUS_QUERY_KEY,
    // The status is what decides the tenant, so it is never held back for disagreeing with it.
    queryFn: () =>
      impersonationService.impersonationStatus({ skipSessionCheck: true }),
    staleTime: 0,
    refetchOnMount: "always",
    // A returning tab asks first and refetches its data after; see useStatusFirstOnTabReturn.
    refetchOnWindowFocus: false,
  });
};

/**
 * Lets the HTTP client check, after every token refresh, that the session is still in the tenant
 * the page is showing, and drop a retry that would otherwise be answered with another tenant's
 * data. The check asks the server; it does not trust anything this tab believes.
 */
export const useSessionTenantGuard = () => {
  const queryClient = useQueryClient();

  useEffect(
    () =>
      HttpClient.setSessionGuard({
        expectedTenant: tenantShown,
        confirmTenant: async () =>
          applyServerStatus(
            queryClient,
            await impersonationService.impersonationStatus(INSIDE_SESSION_LOCK),
          ),
      }),
    [queryClient],
  );
};

/** TanStack Query's own tab-return listener, restored when the guards unmount. */
const listenForVisibility = (onFocus: () => void) => {
  if (typeof window === "undefined" || !window.addEventListener) {
    return undefined;
  }
  const listener = () => onFocus();
  window.addEventListener("visibilitychange", listener, false);
  return () => window.removeEventListener("visibilitychange", listener);
};

const confirmTenantOnReturn = async (
  queryClient: QueryClient,
): Promise<void> => {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const status = await Promise.race([
      impersonationService.impersonationStatus({ skipSessionCheck: true }),
      new Promise<never>((_, reject) => {
        timer = setTimeout(
          () => reject(new Error("Impersonation status timed out")),
          RETURN_STATUS_WAIT_MS,
        );
      }),
    ]);
    applyServerStatus(queryClient, status);
  } catch {
    // Unknown, not moved: the page keeps what it last confirmed.
  } finally {
    clearTimeout(timer);
  }
};

/**
 * On returning to the tab, asks where the session is before refetching anything else.
 *
 * TanStack Query refetches every stale query the moment the tab becomes visible, the status among
 * them. If another tab moved the shared cookie meanwhile, those refetches went out under the new
 * tenant's token while the page still showed the old one, and their answers were cached under the
 * old page's keys. Asking first lets the guards stop rendering the page before anything is sent.
 */
export const useStatusFirstOnTabReturn = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (typeof window === "undefined") return;

    focusManager.setEventListener((onFocus) => {
      const listener = () => {
        if (document.visibilityState === "hidden") {
          onFocus();
          return;
        }
        void confirmTenantOnReturn(queryClient).finally(() => {
          setTimeout(() => onFocus(), FOCUS_REFETCH_DELAY_MS);
        });
      };
      window.addEventListener("visibilitychange", listener, false);
      return () => window.removeEventListener("visibilitychange", listener);
    });

    return () => focusManager.setEventListener(listenForVisibility);
  }, [queryClient]);
};

/**
 * Records where another tab's claim says the shared cookie now is.
 *
 * A claim is first-hand: a tab only makes one after the server confirmed the swap. Without recording
 * it, this tab's cached status stays wherever it last looked, and it looks again only on
 * `visibilitychange` -- which never fires for two windows side by side, both always visible. A
 * console that had stopped impersonation then went on believing the cookie was root after another
 * window re-entered a project, so "Leave <project>" cleared the notice without ever calling stop,
 * and the console rendered under the project's token.
 */
export const useRecordClaimedTenant = () => {
  const queryClient = useQueryClient();

  return useCallback(
    (tenantId: string, rootTenantId: string) => {
      queryClient.setQueryData<ImpersonationStatusResponse>(
        IMPERSONATION_STATUS_QUERY_KEY,
        tenantId === rootTenantId
          ? buildStoppedStatus()
          : (current) => ({
              impersonated: true,
              originalTenantId: current?.originalTenantId || rootTenantId,
              impersonatedTenantId: tenantId,
            }),
      );
    },
    [queryClient],
  );
};

/** What a stop attempt left behind. */
export interface StopImpersonationOutcome {
  /** Where the server says the session is after the attempt. */
  status: ImpersonationStatusResponse;
  /** Why the stop call failed, or null when it succeeded. */
  stopError: unknown;
}

/**
 * Stops impersonation and asks the server where the session ended up, whatever the stop returned.
 *
 * Neither the stop's answer nor its failure says where the cookie is. A stop that never left the
 * browser leaves the session in the project; one whose answer was lost has already moved it; a 401
 * is an expired access token as often as a finished impersonation. Each of those used to be read
 * as "stopped", and the console rendered under the project's token. The status is the only answer
 * that describes the cookie the next request will carry.
 */
const stopAndConfirm = (): Promise<StopImpersonationOutcome> =>
  iamClient.withSessionLock(async () => {
    let stopError: unknown = null;
    try {
      await withRefreshedToken(() =>
        impersonationService.stopImpersonation(INSIDE_SESSION_LOCK),
      );
    } catch (error) {
      stopError = error;
    }
    const status = await withRefreshedToken(() =>
      impersonationService.impersonationStatus(INSIDE_SESSION_LOCK),
    );
    return { status, stopError };
  });

export const useStopImpersonation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["impersonation", "stop"],
    mutationFn: stopAndConfirm,
    onSuccess: ({ status }) => {
      queryClient.setQueryData<ImpersonationStatusResponse>(
        IMPERSONATION_STATUS_QUERY_KEY,
        status,
      );
    },
  });
};

/**
 * Starts (or retargets) impersonation, then confirms with the server that the session is in the
 * target tenant before reporting success.
 *
 * A 200 whose `cookie_set` is not true is treated as a failure, because it is one: the browser
 * authenticates with the HttpOnly cookie and ignores body tokens, so such a response leaves the
 * previous cookie in place. Recording "impersonated" for it used to make the client render a
 * project under whatever tenant the unchanged cookie still pointed at.
 *
 * Even `cookie_set: true` describes the response, not the cookie: a response that lands after it --
 * another tab, or a refresh this tab had in flight -- can replace it. The status check reads the
 * cookie the next request will carry.
 */
const startAndConfirm = (
  request: ImpersonationRequest,
): Promise<{
  result: StartImpersonationResponse;
  status: ImpersonationStatusResponse | null;
}> =>
  iamClient.withSessionLock(async () => {
    const result = await withRefreshedToken(() =>
      impersonationService.startImpersonation(request, INSIDE_SESSION_LOCK),
    );

    if (result?.cookie_set !== true) {
      throw new HttpError(500, {
        errors: {
          general:
            "Impersonation did not replace the session cookie (cookie_set was not true)",
        },
      });
    }

    const status = await withRefreshedToken(() =>
      impersonationService.impersonationStatus(INSIDE_SESSION_LOCK),
    ).catch(() => null);

    return { result, status };
  });

export const useStartImpersonation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["impersonation", "start"],
    mutationFn: async (request: ImpersonationRequest) => {
      const { result, status } = await startAndConfirm(request);
      if (status) {
        queryClient.setQueryData<ImpersonationStatusResponse>(
          IMPERSONATION_STATUS_QUERY_KEY,
          status,
        );
      }
      if (
        !status?.impersonated ||
        !isSameTenant(status.impersonatedTenantId, request.targeted_tenant_id)
      ) {
        throw new HttpError(409, {
          errors: {
            general:
              "The server did not confirm that the session is in the project",
          },
        });
      }
      return result;
    },
    onSuccess: (_data, variables) => {
      // Claimed here rather than at each call site. The access cookie is named after the application
      // domain alone, so every tab on this origin shares one token and the tab that impersonated last
      // owns it; a tab that is visible but not focused keeps polling under it none the wiser. The
      // claim used to live only in the route guard, which the environment cards -- the main way into a
      // project, in both this package and blocks-os -- do not go through, so entering a project from a
      // card silently repointed every other tab's cookie without telling them.
      claimTenant(variables.targeted_tenant_id);
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
