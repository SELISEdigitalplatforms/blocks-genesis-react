import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Loader } from "lucide-react";
import { useAuthStore } from "@/store";

type CallbackPageProps = {
  redirectUrl?: string;
};

export const CallbackPage = ({ redirectUrl }: CallbackPageProps) => {
  const [searchParams] = useSearchParams();
  const hasProcessed = useRef(false);
  const { setAuthenticated } = useAuthStore();

  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const forwardTo = searchParams.get("forwardedTo");
  const error = searchParams.get("error");

  useEffect(() => {
    try {
      if (hasProcessed.current) return;
      hasProcessed.current = true;

      const idpBaseUrl = window.process?.env.userBaseUrl;
      const callbackUrl = new URL(`${idpBaseUrl}/api/idp/callback`);
      const tenantId = window.process?.env.BLOCKS_X_BLOCKS_KEY;
      const appRedirectUrl = forwardTo || redirectUrl || "/";

      // Forward the callback parameters to backend
      if (code) callbackUrl.searchParams.set("code", code);
      if (state) callbackUrl.searchParams.set("state", state);
      if (error) callbackUrl.searchParams.set("error", error);

      const headers: Record<string, string> = {};
      if (tenantId) headers["X-Blocks-Key"] = tenantId;

      fetch(callbackUrl.toString(), { headers, credentials: "include" })
        .then((res) => {
          if (res.ok) {
            setAuthenticated();

            window.location.href = appRedirectUrl;
          } else {
            window.location.href = "/login?error=callback_failed";
          }
        })
        .catch(() => {
          window.location.href = "/login?error=callback_error";
        });
    } catch (err) {
      console.log("Error processing callback:", err);
    }
  }, [code, state, error, setAuthenticated, redirectUrl, forwardTo]);

  const LoaderIcon = Loader as any;
  return (
    <div className="flex min-h-screen items-center justify-center">
      <LoaderIcon className="h-12 w-12 animate-spin text-gray-500" />
    </div>
  );
};
