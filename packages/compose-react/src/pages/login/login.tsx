import { useBlocksAppConfigStore } from "@/hooks/use-blocks-app-config-store";
import { useLogin } from "@/hooks/use-login";
import { useSignUpAffordance, useSignUpRedirect } from "@/hooks/use-signup";
import { useT } from "@/i18n";
import { useMemo } from "react";
import { BlocksLoginPage } from "./blocks-login";
import { getBlocksProducts } from "./login.constant";

export const LoginPage = () => {
  const { t } = useT("genesis.login");
  const products = useMemo(() => getBlocksProducts(t), [t]);
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
      carouselItems={products}
    />
  );
};
