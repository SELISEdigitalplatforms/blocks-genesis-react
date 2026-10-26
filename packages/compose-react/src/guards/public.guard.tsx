import type * as React from "react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { useAuthStore } from "../store/auth.store";
import { isSignInCallbackPath } from "./sign-in-callback";

const useAppState = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return { isMounted };
};

export type PublicGuardProps = {
  children: React.ReactNode;
  defaultProtectedPath?: "/app/console";
};

export function PublicGuard({
  children,
  defaultProtectedPath = "/app/console",
}: PublicGuardProps) {
  const { isAuthenticated } = useAuthStore();
  const { isMounted } = useAppState();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  // Already signed in from an earlier visit -- an app switch, for one -- this used to send the
  // callback to the console before its code exchange had set the new cookie. The console then
  // stopped an impersonation the new session had only just started.
  const isCompletingSignIn = isSignInCallbackPath(pathname);

  useEffect(() => {
    if (!isMounted || isCompletingSignIn) return;
    if (isAuthenticated) navigate(defaultProtectedPath, { replace: true });
  }, [
    isAuthenticated,
    isMounted,
    isCompletingSignIn,
    navigate,
    defaultProtectedPath,
  ]);

  if (!isMounted) return null;
  return <>{children}</>;
}
