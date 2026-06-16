import { APP_SWITCHER_DATA } from "@/components";
import { Card, CardContent } from "@/components/core/card/card";
import { useBlocksAppConfigStore } from "@/hooks/use-blocks-app-config-store";
import { getRuntimeEnv } from "@/lib/runtime-env";
import { usePrefetchRedirect } from "@/hooks/use-initiate";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib";

export const AddProjectCard = () => {
  const { name } = useBlocksAppConfigStore((state) => state.config);
  const navigate = useNavigate();
  const osApp = APP_SWITCHER_DATA.find((app) => app.key === "blocks-os");

  const { isFetching, isReady, redirect } = usePrefetchRedirect({
    clientId: osApp ? getRuntimeEnv(osApp.clientId) : "",
    redirectUri: osApp ? getRuntimeEnv(osApp.redirectUri) : "",
    forwardedTo: "/create-project",
    enabled: name !== "blocks-os" && !!osApp,
  });

  const isDisabled = name !== "blocks-os" && !isReady;

  const handleClick = () => {
    if (name === "blocks-os") {
      navigate("/create-project");
      return;
    }
    redirect();
  };

  return (
    <Card
      onClick={handleClick}
      className={cn(
        "border-primary/30 hover:border-primary/70 flex h-[160px] items-center justify-center rounded-xl border bg-transparent shadow-sm transition-all duration-200 hover:shadow-md md:py-4",
        isDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
      )}
      style={{ pointerEvents: isDisabled ? "none" : "auto" }}
    >
      <CardContent className="p-0 text-center">
        <div className="flex justify-center">
          <Plus className="text-primary" strokeWidth={2} size={50} />
        </div>
        <p className="text-primary mt-2 font-bold">
          {isFetching ? "Loading…" : "Add Project"}
        </p>
      </CardContent>
    </Card>
  );
};
