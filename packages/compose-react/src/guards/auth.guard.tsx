import { AUTH_ENDPOINTS } from "@/constants/endpoint.constant";
import { iamClient } from "@/lib/http/instances";
import type { BaseUser } from "@/models";
import { useAuthStore } from "@/store/auth.store";
import type { ApiResponse } from "@/types";
import { useEffect, useRef } from "react";

export function AuthResolver({ children }: { children: React.ReactNode }) {
  const { setUser, setAuthenticated, setUnAuthenticated } = useAuthStore();
  const hasResolved = useRef(false);

  useEffect(() => {
    if (hasResolved.current) return;
    hasResolved.current = true;

    async function resolve() {
      try {
        const res = await iamClient.get<ApiResponse<BaseUser>>(
          `${AUTH_ENDPOINTS.ME}`,
        );
        setUser(res.data);
        setAuthenticated();
      } catch {
        setUnAuthenticated();
      }
    }
    resolve();
  }, [setAuthenticated, setUnAuthenticated, setUser]);

  return <>{children}</>;
}
