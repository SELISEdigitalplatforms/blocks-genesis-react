import { APP_SWITCHER_DATA } from "@/components";
import { Card, CardContent } from "@/components/core/card/card";
import { getRuntimeEnv } from "@/lib/runtime-env";
import { Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib";
import { useBlocksAppConfigStore } from "@/hooks/use-blocks-app-config-store";

export const AddProjectCard = () => {
  const { name } = useBlocksAppConfigStore((state) => state.config);
  const navigate = useNavigate();
  const osApp = APP_SWITCHER_DATA.find((app) => app.key === "blocks-os");

  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const hasInitiated = useRef(false);

  useEffect(() => {
    if (name === "blocks-os" || !osApp || hasInitiated.current) return;
    hasInitiated.current = true;

    const prefetch = async () => {
      try {
        setIsFetching(true);
        const blocksKey = getRuntimeEnv("BLOCKS_X_BLOCKS_KEY");
        const iamBaseUrl = getRuntimeEnv("userBaseUrl");
        const clientId = getRuntimeEnv(osApp.clientId);
        const redirectUri = getRuntimeEnv(osApp.redirectUri);

        const initiateUrl = `${iamBaseUrl}/api/idp/initiate?x-blocks-key=${blocksKey}&clientId=${clientId}&redirectUri=${redirectUri}&forwardedTo=/create-project`;
        const headers: Record<string, string> = {};
        if (blocksKey) headers["X-Blocks-Key"] = blocksKey;

        const response = await fetch(initiateUrl, { headers });
        const data = await response.json();

        if (data.redirect_uri) {
          setRedirectUrl(data.redirect_uri);
        } else {
          console.error(
            "[AddProjectCard] No redirect_uri in prefetch response",
          );
        }
      } catch (err) {
        console.error("[AddProjectCard] Prefetch failed:", err);
      } finally {
        setIsFetching(false);
      }
    };

    prefetch();
  }, [name, osApp]);

  const handleClick = () => {
    if (name === "blocks-os") {
      navigate("/create-project");
      return;
    }
    if (redirectUrl) {
      window.location.replace(redirectUrl);
    }
  };

  return (
    <Card
      onClick={handleClick}
      className={cn(
        "border-primary/30 hover:border-primary/70 flex h-[160px] items-center justify-center rounded-xl border bg-transparent shadow-sm transition-all duration-200 hover:shadow-md md:py-4",
        isFetching || (name !== "blocks-os" && !redirectUrl)
          ? "cursor-not-allowed opacity-50"
          : "cursor-pointer",
      )}
      style={{
        pointerEvents:
          isFetching || (name !== "blocks-os" && !redirectUrl)
            ? "none"
            : "auto",
      }}
    >
      <CardContent className="p-0 text-center">
        <div className="flex justify-center">
          <Plus className="text-primary" strokeWidth={2} size={50} />
        </div>
        <p className="text-primary mt-2 font-bold">Add Project</p>
      </CardContent>
    </Card>
  );
};
