import { useCallback, useRef } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getRuntimeEnv } from "@/lib/runtime-env";
import { loginService } from "@/services/login.service";
import { signUpService } from "@/services/signup.service";

export interface UseSignUpAffordanceResult {
  /** Whether the tenant offers a signup page worth linking to. */
  canSignUp: boolean;
  isLoading: boolean;
}

/**
 * Whether to render a Sign up control at all.
 *
 * Asked before anyone clicks, so it stays a settings lookup rather than an initiate
 * call. It fails closed: an unreachable or unauthorized settings endpoint means "no
 * affordance", not a retry storm on an unauthenticated page.
 *
 * `isSignUpEnable` is already the OR of the email and SSO flags server-side, so there
 * is nothing further to combine here. The one case it cannot see — SSO signup enabled
 * with no social provider configured, which renders an empty card — is caught by IAM
 * when the button is actually clicked.
 */
export function useSignUpAffordance(): UseSignUpAffordanceResult {
  const tenantId = getRuntimeEnv("BLOCKS_X_BLOCKS_KEY");

  const { data, isLoading } = useQuery({
    queryKey: ["sign-up-setting", tenantId],
    queryFn: () => signUpService.getSignUpSetting(),
    enabled: !!tenantId,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  return {
    canSignUp: !!tenantId && (data?.isSignUpEnable ?? false),
    isLoading: !!tenantId && isLoading,
  };
}

export interface UseSignUpRedirectResult {
  start: () => void;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Sends the user to IAM's signup page.
 *
 * Deliberately the same shape as `useLogin`: ask IAM where to go, then go there. The
 * URL is never built here, because IAM has to validate the clientId and redirect URI
 * against the database first — the redirect URI in particular rides all the way into
 * the activation email, and an unvalidated one silently returns the user to whichever
 * client happens to be first for the tenant.
 */
export function useSignUpRedirect(): UseSignUpRedirectResult {
  // Same synchronous guard as useLogin: React batches the state update from `mutate()`,
  // so `isPending` has not flipped yet within the tick the first click fires in.
  const inFlight = useRef(false);

  const mutation = useMutation({
    mutationKey: ["signup", "start"],
    mutationFn: async () => {
      const data = await loginService.startFlow({
        redirectUri: `${window.location.origin}/login/callback`,
        flow: "signup",
      });

      // An IAM that predates the `flow` parameter ignores it and answers with the
      // authorize URL, which would drop the user on the login page looking like a UI
      // bug rather than a version mismatch. We know what we asked for, so check what
      // came back before navigating anywhere.
      const isSignUpUrl =
        data?.flow === "signup" ||
        !!data?.redirect_uri?.includes("/oidc/signup/");

      if (!data?.redirect_uri || !isSignUpUrl) {
        throw new Error(
          "Signup is unavailable — the identity service did not return a signup URL",
        );
      }

      return data.redirect_uri;
    },
    onSuccess: (redirectUri) => {
      window.location.href = redirectUri;
    },
    onError: (err) => {
      console.error("Error initiating signup:", err);
    },
    onSettled: () => {
      inFlight.current = false;
    },
  });

  const start = useCallback(() => {
    if (inFlight.current) return;
    if (mutation.isPending) return;
    inFlight.current = true;
    mutation.mutate();
  }, [mutation]);

  const error = mutation.error instanceof Error ? mutation.error : null;

  return {
    start,
    isLoading: mutation.isPending,
    error,
  };
}
