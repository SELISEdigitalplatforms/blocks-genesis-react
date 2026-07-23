import { cn } from "@/lib/utils";

type LogoProps = Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src"> & {
  src?: string;
  lightSrc?: string;
  darkSrc?: string;
};
import DEFAULT_LIGHT_LOGO from "@/assets/logos/logo-light.svg";
import DEFAULT_DARK_LOGO from "@/assets/logos/logo-dark.svg";

export function Logo({
  src,
  lightSrc,
  darkSrc,
  alt = "Logo",
  className,
  ...props
}: LogoProps) {
  const lightLogo = lightSrc ?? src ?? DEFAULT_LIGHT_LOGO;
  const darkLogo = darkSrc ?? src ?? DEFAULT_DARK_LOGO;

  return (
    <>
      <img
        {...props}
        src={lightLogo}
        alt={alt}
        className={cn("dark:hidden", className)}
      />
      <img
        {...props}
        src={darkLogo}
        alt={alt}
        className={cn("hidden dark:block", className)}
      />
    </>
  );
}
