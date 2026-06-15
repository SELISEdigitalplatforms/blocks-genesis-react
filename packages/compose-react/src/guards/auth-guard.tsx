import { iamClient } from "@/lib/http";
import { useEffect, useRef } from "react";
import { useAuthStore } from "../store/auth.store";
import type { BaseUser } from "@/types";

export function AuthResolver({ children }: { children: React.ReactNode }) {
  const { setUser, setAuthenticated, setUnAuthenticated } = useAuthStore();
  const hasResolved = useRef(false);
  //   const { isMounted, } = useAppState();

  useEffect(() => {
    if (hasResolved.current) return;
    hasResolved.current = true;

    async function resolve() {
      try {
        const res = await iamClient.get<{ data: BaseUser }>("/api/iam/me");
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
