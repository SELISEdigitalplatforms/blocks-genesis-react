import {
  Button,
  DesktopMenuItem,
  EnvironmentList,
  Logo,
  ProjectList,
  RenderAlternatively,
  RenderConditionally,
  Separator,
} from "@/components";
import { SidebarContext } from "@/contexts/dashboard-layout";
import { useIcon } from "@/hooks/use-icon";
import { useLogo } from "@/hooks/use-logo";
import { useFilteredMenus, useIsActiveMenu } from "@/hooks/use-menus";
import { cn } from "@/lib/utils";
import { PanelLeft } from "lucide-react";
import { Fragment, useContext } from "react";
import { Link } from "react-router-dom";
import type { SideBarMenuProps } from "./types";

export function SidebarMenuDesktop({
  redirectPaths,
  navigationMenus,
}: SideBarMenuProps) {
  const { isSidebarOpen, toggleSidebar } = useContext(SidebarContext);
  const { appLightLogo, appDarkLogo } = useLogo();
  const icon = useIcon();
  const allowedMenu = useFilteredMenus(navigationMenus);

  const { isActivePath: isProjectOverviewRoute } =
    useIsActiveMenu("/app/project");

  return (
    <div
      className={`hidden h-screen shrink-0 flex-col border-r bg-background transition-all md:flex ${isSidebarOpen ? "min-w-60" : "w-14"}`}
    >
      <div className="flex h-[60px] shrink-0 items-center justify-between border-b bg-background px-3">
        <Link
          to="console"
          className={cn(
            "relative inline-block cursor-pointer overflow-hidden transition-all",
            isSidebarOpen ? "h-9 w-[72px]" : "h-8 w-8",
          )}
        >
          <RenderAlternatively
            condition={isSidebarOpen}
            whenTrue={
              <Logo
                lightSrc={appLightLogo}
                darkSrc={appDarkLogo}
                alt="Logo"
                className="h-full w-full object-contain"
              />
            }
            whenFalse={icon}
          />
        </Link>
        <RenderConditionally condition={isSidebarOpen}>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 p-0"
            onClick={toggleSidebar}
          >
            <PanelLeft className="h-6 w-6" />
          </Button>
        </RenderConditionally>
      </div>
      {isSidebarOpen ? (
        <div className="border-b px-2 pb-2 pt-2">
          <p className="mb-1 px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Workspace
          </p>
          <div className="space-y-0.5">
            <ProjectList redirectPaths={redirectPaths} />
            <RenderConditionally condition={!isProjectOverviewRoute}>
              <EnvironmentList redirectPaths={redirectPaths} />
            </RenderConditionally>
          </div>
        </div>
      ) : (
        <div className="border-b py-1">
          <ProjectList redirectPaths={redirectPaths} collapsed={true} />
          <RenderConditionally condition={!isProjectOverviewRoute}>
            <EnvironmentList redirectPaths={redirectPaths} collapsed={true} />
          </RenderConditionally>
        </div>
      )}
      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
        <nav className={cn("grid w-full items-start gap-1 text-sm")}>
          {allowedMenu.map((menu) => (
            <Fragment key={menu.id}>
              {menu.type === "menu" ? (
                <DesktopMenuItem menu={menu} isSidebarOpen={isSidebarOpen} />
              ) : (
                <Separator />
              )}
            </Fragment>
          ))}
        </nav>
      </div>
    </div>
  );
}
