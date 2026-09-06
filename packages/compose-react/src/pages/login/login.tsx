import { useBlocksAppConfigStore } from "@/hooks/use-blocks-app-config-store";
import { useLogin } from "@/hooks/use-login";
import { useSignUpAffordance, useSignUpRedirect } from "@/hooks/use-signup";
import { BlocksLoginPage } from "./blocks-login";
import { BLOCKS_PRODUCTS } from "./login.constant";

export const LoginPage = () => {
  const config = useBlocksAppConfigStore((state) => state.getConfig());
  const { start, isLoading } = useLogin();
  const { canSignUp } = useSignUpAffordance();
  const { start: startSignUp, isLoading: isSignUpLoading } =
    useSignUpRedirect();

  return (
    <BlocksLoginPage
      name={config.name}
      onLogin={start}
      isLoading={isLoading}
      showSignUp={canSignUp}
      onSignUp={startSignUp}
      isSignUpLoading={isSignUpLoading}
      carouselItems={BLOCKS_PRODUCTS}
    />
  );
};
