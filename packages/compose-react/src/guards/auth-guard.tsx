import { HttpClient } from "@/lib/http";
import { getRuntimeEnv } from "@/lib/runtime-env";
import { useEffect, useRef } from "react";
import { useAuthStore } from "../store/auth.store";

const http = new HttpClient({
  baseURL: getRuntimeEnv("BLOCKS_OS_BASE_URL") || "",
  blocksKey: getRuntimeEnv("BLOCKS_X_BLOCKS_KEY") || "",
});

export function AuthResolver({ children }: { children: React.ReactNode }) {
  const { setUser, setAuthenticated, setUnAuthenticated } = useAuthStore();
  const hasResolved = useRef(false);
  //   const { isMounted, } = useAppState();

  useEffect(() => {
    if (hasResolved.current) return;
    hasResolved.current = true;

    async function resolve() {
      try {
        const baseUrl = window.process?.env.userBaseUrl;
        const res = await http.get<{ data: any }>(
          `${baseUrl}/api/iam/me`,
          undefined,
          {
            absoluteUrl: true,
          },
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
