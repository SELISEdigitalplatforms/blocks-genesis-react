import { filteredAppSwitcherData } from "@/components";
import { useBlocksAppConfigStore } from "@/hooks/use-blocks-app-config-store";
import { usePrefetchRedirect } from "@/hooks/use-initiate";
import { getRuntimeEnv } from "@/lib/runtime-env";
import { useNavigate } from "react-router";

export function useCreateProjectRedirect() {
  const { name } = useBlocksAppConfigStore((state) => state.config);
  const navigate = useNavigate();
  const osApp = filteredAppSwitcherData.find((app) => app.key === "blocks-os");

  const { isFetching, isReady, redirect } = usePrefetchRedirect({
    clientId: osApp ? getRuntimeEnv(osApp.clientId) : "",
    redirectUri: osApp ? getRuntimeEnv(osApp.redirectUri) : "",
    forwardedTo: "/app/create-project",
    enabled: name !== "blocks-os" && !!osApp,
  });

  const isDisabled = name !== "blocks-os" && !isReady;

  const handleClick = () => {
    if (name === "blocks-os") {
      navigate("/app/create-project");
      return;
    }
    redirect();
  };

  return {
    handleClick,
    isDisabled,
    isFetching,
  };
}
