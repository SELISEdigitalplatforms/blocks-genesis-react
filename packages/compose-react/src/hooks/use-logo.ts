import { useBlocksAppConfigStore } from "@/hooks/use-blocks-app-config-store";

export function useLogo() {
  const {
    config: { appLogoUrl },
  } = useBlocksAppConfigStore((state) => state);

  const appLightLogo = appLogoUrl
    ? typeof appLogoUrl === "string"
      ? appLogoUrl
      : appLogoUrl.light
    : undefined;

  const appDarkLogo = appLogoUrl
    ? typeof appLogoUrl === "string"
      ? appLogoUrl
      : appLogoUrl.dark
    : undefined;

  return {
    appLightLogo,
    appDarkLogo,
  };
}
