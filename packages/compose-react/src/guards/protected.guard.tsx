import type * as React from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import { subscribeToSignOut } from "@/lib/tenant-ownership";
import { useAuthStore } from "../store/auth.store";

interface ProtectedGuardProps {
  children: React.ReactNode;
  defaultPublicPath?: "/login";
}

export function ProtectedGuard({
  children,
  defaultPublicPath = "/login",
}: ProtectedGuardProps) {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) navigate(defaultPublicPath);
  }, [isAuthenticated, defaultPublicPath, navigate]);

  // Another tab signed out. A full load drops this tab's in-memory data, so nothing the previous
  // user saw stays on screen for whoever signs in next.
  useEffect(
    () =>
      subscribeToSignOut(() =>
        window.location.replace(
          `${window.location.origin}${defaultPublicPath}`,
        ),
      ),
    [defaultPublicPath],
  );

  return <>{children}</>;
}
