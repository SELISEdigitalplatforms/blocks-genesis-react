import { AUTH_ENDPOINTS } from "@/constants/endpoint.constant";
import { iamClient } from "@/lib/http/instances";
import type { BaseUser } from "@/models";
import { useAuthStore } from "@/store/auth.store";
import { useEffect, useRef } from "react";
import { isSignInCallbackPath } from "./sign-in-callback";

export function AuthResolver({ children }: { children: React.ReactNode }) {
  const { setUser, setAuthenticated, setUnAuthenticated } = useAuthStore();
  const hasResolved = useRef(false);

  useEffect(() => {
    if (hasResolved.current) return;
    hasResolved.current = true;
    // The callback page signs in and reloads into the app, where this runs again. Asking now would
    // send the old cookie -- and, if it has expired, refresh it -- while the code exchange is
    // replacing it, and whichever response landed last would win the cookie.
    if (isSignInCallbackPath(window.location.pathname)) return;

    async function resolve() {
      try {
        const res = await iamClient.get<BaseUser>(`${AUTH_ENDPOINTS.ME}`);
        setUser(res);
        setAuthenticated();
      } catch {
        setUnAuthenticated();
      }
    }
    resolve();
  }, [setAuthenticated, setUnAuthenticated, setUser]);

  return <>{children}</>;
}
