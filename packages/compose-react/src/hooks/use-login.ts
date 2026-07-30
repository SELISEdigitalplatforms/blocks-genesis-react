import { useCallback, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { loginService } from "@/services/login.service";

export interface UseLoginResult {
  start: () => void;
  isLoading: boolean;
  error: Error | null;
}

// `useRef` is the synchronous dedupe guard: React batches the state update
// triggered by `mutate()`, so `mutation.isPending` does not flip to `true`
// within the same event tick in which `start()` was first invoked. Without
// this guard, rapid clicks would each fire a fresh `mutate()`.
export function useLogin(): UseLoginResult {
  const inFlight = useRef(false);

  const mutation = useMutation({
    mutationKey: ["login", "start"],
    mutationFn: loginService.startLogin,
    onSuccess: (data) => {
      if (data?.redirect_uri) {
        window.location.href = data.redirect_uri;
      }
    },
    onError: (err) => {
      console.error("Error initiating login:", err);
    },
    onSettled: () => {
      inFlight.current = false;
    },
  });

  const start = useCallback(() => {
    if (inFlight.current) return;
    if (mutation.isPending) return;
    inFlight.current = true;
    mutation.mutate({
      redirectUri: `${window.location.origin}/login/callback`,
    });
  }, [mutation]);

  const error = mutation.error instanceof Error ? mutation.error : null;

  return {
    start,
    isLoading: mutation.isPending,
    error,
  };
}
