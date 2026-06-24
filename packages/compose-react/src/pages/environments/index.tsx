import { useInitiateRedirect } from "@/hooks/use-initiate";
import { getRuntimeEnv } from "@/lib/runtime-env";

export const EnvironmentsPage = () => {
  const { isLoading, error } = useInitiateRedirect({
    clientId: getRuntimeEnv("BLOCKS_OS_CLIENT_ID"),
    redirectUri: getRuntimeEnv("BLOCKS_OS_CALLBACK_URL"),
    forwardedTo: "/app/project-overview/environments",
  });

  if (error)
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium text-destructive">
            Failed to redirect to environments page
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
          Redirecting to environments page…
        </p>
      </div>
    );

  return null;
};
