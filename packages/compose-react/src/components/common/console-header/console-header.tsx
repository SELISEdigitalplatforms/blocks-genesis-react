import { AppSwitcher } from "@/components/common/app-switcher";
import { Logo } from "@/components/common/logo";
import { ThemeSwitcher } from "@/components/common/theme-switcher";
import { Button } from "@/components/core/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/core/sheet";
import { useLogo } from "@/hooks/use-logo";
import { MenuIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Notification } from "../notification";
import { UserDropdownMenu } from "../user-dropdown-menu/user-dropdown-menu";

export function ConsoleHeader() {
  const { pathname } = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);

  const isConsoleButtonVisible =
    pathname.includes("/project") || pathname.includes("profile");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 25);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const { appLightLogo, appDarkLogo } = useLogo();

  return (
    <div
      className={`fixed left-0 right-0 top-0 z-40 ${isScrolled || isConsoleButtonVisible ? "bg-background border-b" : "bg-transparent"}`}
    >
      <header
        className={`lg:h-14.75 mx-5 flex h-12 items-center gap-4 ${isConsoleButtonVisible ? "sm:ml-1 sm:mr-6" : "sm:mx-10"}`}
      >
        <div
          className={`mx-0 flex h-full w-full flex-row items-center md:mx-auto`}
        >
          <div className="w-57 ml-2 flex h-full items-center">
            <Link to="console" className="cursor-pointer">
              <Logo
                width={96}
                height={32}
                className="h-8 w-auto"
                lightSrc={appLightLogo}
                darkSrc={appDarkLogo}
              />
            </Link>
          </div>
        </div>
        <div className="block sm:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline">
                <MenuIcon className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="top"
              className={`flex w-full flex-wrap items-start gap-3 ${isConsoleButtonVisible ? "justify-between" : "justify-end"}`}
            >
              {isConsoleButtonVisible && (
                <div className="min-w-fit shrink"></div>
              )}
              <div className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-3">
                <ThemeSwitcher />
                <Notification />
                <AppSwitcher forwardedTo="/app/console" />
                <UserDropdownMenu />
              </div>
            </SheetContent>
          </Sheet>
        </div>
        <div className="hidden sm:flex sm:items-center sm:gap-4">
          <ThemeSwitcher />
          <Notification />
          <AppSwitcher forwardedTo="/app/console" />
          <UserDropdownMenu />
        </div>
      </header>
    </div>
  );
}
