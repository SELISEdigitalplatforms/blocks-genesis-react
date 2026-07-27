import type * as React from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuthStore } from "../store/auth.store";

interface ProtectedGuardProps {
  children: React.ReactNode;
  defaultPublicPath?: string;
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

  return <>{children}</>;
}
