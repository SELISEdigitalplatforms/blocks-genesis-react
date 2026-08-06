import { useBlocksAppConfigStore } from "@/hooks/use-blocks-app-config-store";
import { useLogin } from "@/hooks/use-login";
import { BlocksLoginPage } from "./blocks-login";
import { BLOCKS_PRODUCTS } from "./login.constant";

export const LoginPage = () => {
  const config = useBlocksAppConfigStore((state) => state.getConfig());
  const { start, isLoading } = useLogin();

  return (
    <BlocksLoginPage
      name={config.name}
      onLogin={start}
      isLoading={isLoading}
      carouselItems={BLOCKS_PRODUCTS}
    />
  );
};
