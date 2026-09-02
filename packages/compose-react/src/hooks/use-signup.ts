import { useQuery } from "@tanstack/react-query";
import { resolveBaseUrl } from "@/lib/http/util";
import { getRuntimeEnv } from "@/lib/runtime-env";
import { signUpService } from "@/services/signup.service";

export interface UseSignUpAffordanceResult {
  /** Absolute URL of the IAM signup page, or `undefined` when signup is closed. */
  signUpUrl?: string;
  isLoading: boolean;
}

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

/**
 * Resolves whether this tenant offers self-service signup, and where to send
 * people if it does.
 *
 * Two conditions have to hold, and both fail closed:
 *
 * 1. A tenant and an IAM host are configured. blocks-iam only routes
 *    `/oidc/signup/:tenantId` — the un-scoped `/oidc/signup` is not a route —
 *    so without a tenant there is no link worth rendering.
 * 2. The tenant has signup switched on. Linking regardless would drop people
 *    on a signup page that renders no form.
 */
export function useSignUpAffordance(): UseSignUpAffordanceResult {
  const tenantId = getRuntimeEnv("BLOCKS_X_BLOCKS_KEY");
  const iamBaseUrl = resolveBaseUrl("user");
  const isConfigured = !!tenantId && !!iamBaseUrl;

  const { data, isLoading } = useQuery({
    queryKey: ["sign-up-setting", tenantId],
    queryFn: () => signUpService.getSignUpSetting(),
    enabled: isConfigured,
    // An unreachable or unauthorized settings call means "no affordance", not a
    // retry storm on an unauthenticated page.
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const isEnabled = isConfigured && (data?.isSignUpEnable ?? false);

  return {
    signUpUrl: isEnabled
      ? `${trimTrailingSlash(iamBaseUrl)}/oidc/signup/${encodeURIComponent(tenantId)}`
      : undefined,
    isLoading: isConfigured && isLoading,
  };
}
