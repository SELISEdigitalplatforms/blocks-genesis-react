import { useBlocksAppConfigStore } from "@/hooks/use-blocks-app-config-store";
import { useState } from "react";
import { BlocksLoginPage, type LoginCarouselItem } from "./blocks-login";
import { BLOCKS_PRODUCTS } from "./login.constant";

export const LoginPage = () => {
  const config = useBlocksAppConfigStore((state) => state.getConfig());
  const [isStarting, setIsStarting] = useState(false);

  const startLogin = async () => {
    try {
      if (isStarting) return;
      setIsStarting(true);
      const blocksKey = window.process?.env.BLOCKS_X_BLOCKS_KEY;
      const clientId = window.process?.env.BLOCKS_OIDC_CLIENT_ID;
      const baseUrl = window.process?.env.userBaseUrl;
      const redirectUri = `${window.location.origin}/login/callback`;
      const initiateUrl = `${baseUrl}/api/idp/initiate?x-blocks-key=${blocksKey}&clientId=${clientId}&redirectUri=${redirectUri}`;
      const headers: Record<string, string> = {};
      if (blocksKey) headers["X-Blocks-Key"] = blocksKey;
      const response = await fetch(initiateUrl.toString(), { headers });

      const data = await response.json();
      if (data.redirect_uri) {
        window.location.href = data.redirect_uri;
      } else {
        setIsStarting(false);
      }
    } catch (error) {
      console.error("Error initiating login:", error);
      setIsStarting(false);
    }
  };

  return (
    <BlocksLoginPage
      name={config.name}
      onLogin={startLogin}
      isLoading={isStarting}
      carouselItems={BLOCKS_PRODUCTS as LoginCarouselItem[]}
    />
  );
};
