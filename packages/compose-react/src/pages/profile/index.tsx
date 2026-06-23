import { getRuntimeEnv } from "@/lib/runtime-env";
import { useInitiateRedirect } from "@/hooks/use-initiate";

export function ProfilePage() {
  const { isLoading, error } = useInitiateRedirect({
    clientId: getRuntimeEnv("BLOCKS_IAM_CLIENT_ID"),
    redirectUri: getRuntimeEnv("BLOCKS_IAM_CALLBACK_URL"),
    forwardedTo: "profile",
  });

  if (error)
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

  if (isLoading)
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Redirecting to profile page…
        </p>
      </div>
    );

  return null;
}
