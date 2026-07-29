import { filteredAppSwitcherData } from "@/components/common/app-switcher";
import { useBlocksAppConfigStore } from "@/hooks/use-blocks-app-config-store";
import { usePrefetchRedirect } from "@/hooks/use-initiate";
import { getRuntimeEnv } from "@/lib/runtime-env";
import { useNavigate } from "react-router";

type UseProjectOverviewRedirectProps = {
  tenantGroupId: string;
};

export function useProjectOverviewRedirect({
  tenantGroupId,
}: UseProjectOverviewRedirectProps) {
  const navigate = useNavigate();
  const { name } = useBlocksAppConfigStore((state) => state.config);
  const osApp = filteredAppSwitcherData.find((app) => app.key === "blocks-os");
  const redirectedRoute = `/app/project/${tenantGroupId}/environments`;

  const { isFetching, isReady, redirect } = usePrefetchRedirect({
    clientId: osApp ? getRuntimeEnv(osApp.clientId) : "",
    redirectUri: osApp ? getRuntimeEnv(osApp.redirectUri) : "",
    forwardedTo: redirectedRoute,
    enabled: name !== "blocks-os" && !!osApp,
  });

  const isDisabled = name !== "blocks-os" && !isReady;

  const handleClick = () => {
    if (name === "blocks-os") {
      navigate(redirectedRoute);
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
