import { Fragment, useState } from "react";
import { Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Button,
  EnvironmentList,
  MobileMenuItem,
  ProjectList,
  Separator,
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components";
import { Logo } from "../logo";
import type { SideBarMenuProps } from "./types";
import { useFilteredMenus } from "@/hooks/use-menus";
import { useLogo } from "@/hooks/use-logo";

export function SidebarMobileView({
  redirectPaths,
  navigationMenus,
}: SideBarMenuProps) {
  const [open, setOpen] = useState(false);
  const { appLightLogo, appDarkLogo } = useLogo();

  const allowedMenu = useFilteredMenus(navigationMenus);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="shrink-0">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-full overflow-y-auto p-0"
        aria-describedby={undefined}
        hideClose
      >
        <SheetHeader className="h-[60px] px-4 py-3">
          <SheetTitle className="flex items-center justify-between">
            <Link to="console">
              <Logo
                width={72}
                height={36}
                className="h-9 w-auto"
                lightSrc={appLightLogo}
                darkSrc={appDarkLogo}
                alt="Logo"
              />
            </Link>
            <SheetClose className="mt-0!">
              <X className="h-4 w-4" />
            </SheetClose>
          </SheetTitle>
        </SheetHeader>
        <Separator />
        <div className="mt-3 flex w-full flex-col items-start px-6">
          <div className="ml-1 text-sm text-low-emphasis">Project</div>
          <ProjectList redirectPaths={redirectPaths} />
        </div>
        <div className="my-3 flex w-full flex-col items-start px-6">
          <div className="ml-1 text-sm text-low-emphasis">Environment</div>
          <EnvironmentList redirectPaths={redirectPaths} />
        </div>
        <Separator />
        <nav className="grid gap-2">
          {allowedMenu.map((menu) => (
            <Fragment key={menu.id}>
              {menu.type === "menu" ? (
                <MobileMenuItem menu={menu} onClick={() => setOpen(false)} />
              ) : (
                <Separator />
              )}
            </Fragment>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
