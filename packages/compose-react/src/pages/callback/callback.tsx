import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router";
import { Loader } from "lucide-react";
import { useAuthStore } from "@/store";

type CallbackPageProps = {
  defaultRedirectUrl?: string;
};

// forwardedTo comes from the URL, so anyone can set it. Only an app-relative path is allowed:
// "//host" and "/\\host" are read by browsers as another host, and "javascript:" / absolute URLs
// would leave the app or run script after a successful login. Prefix checks alone are not enough:
// browsers drop tab/newline from URLs, so "/\t/host" becomes "//host". Let the URL parser decide
// and keep only same-origin results. Return the full href, never pathname: "/.//host" normalises
// to the path "//host", which a browser would again read as another host.
const toSafeAppPath = (value: string | null): string | null => {
  if (!value || !value.startsWith("/")) return null;
  try {
    const target = new URL(value, window.location.origin);
    if (target.origin !== window.location.origin) return null;
    return target.href;
  } catch {
    return null;
  }
};

export const CallbackPage = ({ defaultRedirectUrl }: CallbackPageProps) => {
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
      const appRedirectUrl =
        toSafeAppPath(forwardTo) || defaultRedirectUrl || "/";

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
      console.error("Error processing callback:", err);
    }
  }, [code, state, error, setAuthenticated, defaultRedirectUrl, forwardTo]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader className="h-12 w-12 animate-spin text-gray-500" />
    </div>
  );
};
