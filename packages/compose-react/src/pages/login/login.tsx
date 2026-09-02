import { useBlocksAppConfigStore } from "@/hooks/use-blocks-app-config-store";
import { useLogin } from "@/hooks/use-login";
import { useSignUpAffordance } from "@/hooks/use-signup";
import { BlocksLoginPage } from "./blocks-login";
import { BLOCKS_PRODUCTS } from "./login.constant";

export const LoginPage = () => {
  const config = useBlocksAppConfigStore((state) => state.getConfig());
  const { start, isLoading } = useLogin();
  const { signUpUrl } = useSignUpAffordance();

  return (
    <BlocksLoginPage
      name={config.name}
      onLogin={start}
      isLoading={isLoading}
      signUpUrl={signUpUrl}
      carouselItems={BLOCKS_PRODUCTS}
    />
  );
};
