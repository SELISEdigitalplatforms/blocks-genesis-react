import { useBlocksAppConfigStore } from "@/hooks/use-blocks-app-config-store";

export function useLogo() {
  const {
    config: { appLogoUrl },
  } = useBlocksAppConfigStore((state) => state);

  const resolveLogo = (variant: "light" | "dark") => {
    if (!appLogoUrl) return undefined;
    if (typeof appLogoUrl === "string") return appLogoUrl;
    return appLogoUrl[variant];
  };

  const appLightLogo = resolveLogo("light");
  const appDarkLogo = resolveLogo("dark");

  return {
    appLightLogo,
    appDarkLogo,
  };
}
