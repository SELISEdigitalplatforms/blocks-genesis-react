import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router";
import { Loader } from "lucide-react";
import { claimTenant } from "@/lib/tenant-ownership";
import { impersonationService } from "@/services/impersonation.service";
import { useAuthStore } from "@/store";

type CallbackPageProps = {
  defaultRedirectUrl?: string;
};

/** How long signing in waits to tell the other tabs where the session is, before going on anyway. */
const ANNOUNCE_WAIT_MS = 3_000;

/**
 * Tells this app's other tabs which tenant the new session is in.
 *
 * The code exchange replaced the cookie every tab shares, and it can land straight inside a project:
 * an app switch from a project page arrives impersonated. Without a claim the other tabs went on
 * rendering their own tenant on the new session's token. A console session is claimed too, so a
 * project tab learns that its project is no longer open.
 */
const announceNewSession = async (): Promise<void> => {
  const rootTenantId = window.process?.env.BLOCKS_X_BLOCKS_KEY || "";
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const status = await Promise.race([
      impersonationService.impersonationStatus({ skipSessionCheck: true }),
      new Promise<never>((_, reject) => {
        timer = setTimeout(
          () => reject(new Error("Impersonation status timed out")),
          ANNOUNCE_WAIT_MS,
        );
      }),
    ]);
    const tenantId = status.impersonated
      ? status.impersonatedTenantId
      : rootTenantId;
    if (tenantId) claimTenant(tenantId);
  } catch {
    // The other tabs still find out on their next status check; signing in is not held up for it.
  } finally {
    clearTimeout(timer);
  }
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
        .then(async (res) => {
          if (res.ok) {
            await announceNewSession();
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
