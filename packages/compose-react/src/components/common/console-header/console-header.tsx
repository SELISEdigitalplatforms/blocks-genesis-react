import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { useLocation, Link } from "react-router-dom";
import { Logo } from "@/components/common/logo";
import { Button } from "@/components/core/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/core/sheet";
import { ThemeSwitcher } from "@/components/common/theme-switcher";
import { AppSwitcher } from "@/components/common/app-switcher";
import { UserDropdownMenu } from "../user-dropdown-menu/user-dropdown-menu";
import { Notification } from "../notification";

export function ConsoleHeader() {
  const { pathname } = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);

  const isConsoleButtonVisible =
    pathname.startsWith("/project-overview") || pathname.startsWith("/profile");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 25);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={`fixed left-0 right-0 top-0 z-40 ${isScrolled || isConsoleButtonVisible ? "bg-background border-b" : "bg-transparent"}`}
    >
      <header
        className={`lg:h-14.75 mx-5 flex h-12 items-center gap-4 ${isConsoleButtonVisible ? "sm:ml-1 sm:mr-6" : "sm:mx-10"}`}
      >
        <div className={`mx-0 flex h-full w-full flex-row items-center md:mx-auto`}>
          <div className="w-57 ml-2 flex h-full items-center">
            <Link to="/console" className="cursor-pointer">
              <Logo width={96} height={32} className="h-8 w-auto" />
            </Link>
          </div>
        </div>
        <div className="block sm:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              //   hideClose
              side="top"
              className={`flex w-full flex-wrap items-start gap-3 ${isConsoleButtonVisible ? "justify-between" : "justify-end"}`}
            >
              {isConsoleButtonVisible && (
                <div className="min-w-fit shrink">{/* <BackToConsoleNavigator /> */}</div>
              )}
              <div className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-3">
                <ThemeSwitcher />
                <Notification />
                <AppSwitcher />
                <UserDropdownMenu />
              </div>
            </SheetContent>
          </Sheet>
        </div>
        <div className="hidden sm:flex sm:items-center sm:gap-4">
          {/* {isConsoleButtonVisible && <BackToConsoleNavigator />} */}
          <ThemeSwitcher />
          <Notification />
          <AppSwitcher />
          <UserDropdownMenu />
        </div>
      </header>
    </div>
  );
}
