import type * as React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/auth.store";

export const useAppState = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return { isMounted };
};

export type PublicGuardProps = {
  children: React.ReactNode;
  defaultProtectedPath?: string;
};

export function PublicGuard({
  children,
  defaultProtectedPath = "/console",
}: PublicGuardProps) {
  const { isAuthenticated } = useAuthStore();
  const { isMounted } = useAppState();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isMounted) return;
    if (isAuthenticated) navigate(defaultProtectedPath, { replace: true });
  }, [isAuthenticated, isMounted, navigate, defaultProtectedPath]);

  if (!isMounted) return null;
  return <>{children}</>;
}
