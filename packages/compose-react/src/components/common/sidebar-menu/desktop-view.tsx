import { useFilteredMenus } from "@/hooks/use-filtered-menus";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";
import { PanelLeft } from "lucide-react";
import { Fragment, useContext, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import type { SideBarMenuProps } from "./types";
import {
  Button,
  DesktopMenuItem,
  EnvironmentList,
  ProjectList,
  Separator,
} from "@/components";
import { SidebarContext } from "@/contexts/dashboard-layout";

export function SidebarMenuDesktop({
  redirectPaths,
  navigationMenus,
}: SideBarMenuProps) {
  const { isSidebarOpen, toggleSidebar } = useContext(SidebarContext);
  const { resolvedTheme } = useTheme();
  const allowedMenu = useFilteredMenus(navigationMenus);
  const { pathname } = useLocation();

  const isProjectOverviewRoute = pathname.startsWith("/project-overview");

  const getLogoSrc = useMemo(() => {
    if (isSidebarOpen) {
      return resolvedTheme === "dark" ? "/Logo_Dark.svg" : "/Logo_Light.svg";
    }
    return resolvedTheme === "dark" ? "/Icon_Dark.svg" : "/Icon_Light.svg";
  }, [isSidebarOpen, resolvedTheme]);

  return (
    <div
      className={`hidden h-[calc(100vh)] flex-col border-r bg-background transition-all md:flex ${isSidebarOpen ? "min-w-60" : "w-14"}`}
    >
      <div className="flex h-[60px] shrink-0 items-center justify-between border-b bg-background px-3">
        <Link
          to="/console"
          className={cn(
            "relative inline-block cursor-pointer overflow-hidden transition-all",
            isSidebarOpen ? "h-[36px] w-[72px]" : "h-8 w-8",
          )}
        >
          <img
            src={getLogoSrc}
            alt="Logo"
            className="h-full w-full object-contain"
          />
        </Link>
        {isSidebarOpen && (
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 p-0"
            onClick={toggleSidebar}
          >
            <PanelLeft className="h-6 w-6" />
          </Button>
        )}
      </div>
      {!isProjectOverviewRoute &&
        (isSidebarOpen ? (
          <div className="border-b px-2 pb-2 pt-2">
            <p className="mb-1 px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Workspace
            </p>
            <div className="space-y-0.5">
              <ProjectList redirectPaths={redirectPaths} />
              <EnvironmentList redirectPaths={redirectPaths} />
            </div>
          </div>
        ) : (
          <div className="border-b py-1">
            <ProjectList redirectPaths={redirectPaths} collapsed={true} />
            <EnvironmentList redirectPaths={redirectPaths} collapsed={true} />
          </div>
        ))}
      <div className="flex-1 overflow-auto">
        <nav className={cn("grid w-full items-start gap-1 p-2 text-sm")}>
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
