import { getRuntimeEnv } from "@/lib/runtime-env";
import { useEffect, useState, useRef } from "react";



export function ProfilePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const hasInitiated = useRef(false);

  useEffect(() => {
    if (hasInitiated.current) return;
    hasInitiated.current = true;
    
    const initiateProfileRedirect = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const blocksKey = getRuntimeEnv("BLOCKS_X_BLOCKS_KEY");
        const iamBaseUrl = getRuntimeEnv("userBaseUrl");
        const clientId = getRuntimeEnv("BLOCKS_IAM_CLIENT_ID");
        const redirectUri = getRuntimeEnv("BLOCKS_IAM_CALLBACK_URL");

        const initiateUrl = `${iamBaseUrl}/api/idp/initiate?x-blocks-key=${blocksKey}&clientId=${clientId}&redirectUri=${redirectUri}&forwardedTo=/profile`;
        const headers: Record<string, string> = {};
        if (blocksKey) headers["X-Blocks-Key"] = blocksKey;

        const response = await fetch(initiateUrl, { headers });
        const data = await response.json();

        if (data.redirect_uri) {
          window.location.replace(data.redirect_uri);
        } else {
          throw new Error("No redirect_uri received from server");
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to redirect to profile");
        setError(error);
        console.error("[ProfilePage] Failed to redirect:", error);

      } finally {
        setIsLoading(false);
      }
    };

    initiateProfileRedirect();
  }, []);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium text-destructive">
            Failed to redirect to profile page
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Please check your console for more details
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Redirecting to profile page…
        </p>
      </div>
    );
  }

  return null;
}
