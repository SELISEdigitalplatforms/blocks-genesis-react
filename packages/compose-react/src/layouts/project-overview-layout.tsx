import { DashboardHeader, SidebarMenuDesktop } from "@/components";
import {
  ImpersonationChecker,
  ImpersonationTerminator,
} from "@/guards/impersonation.guard";
import type * as React from "react";
import type { LayoutProps } from "./layout.types";
import { DashboardLayoutProvider } from "@/contexts/dashboard-layout/dashboard-layout-provider";

export interface ProjectOverviewLayoutProps extends LayoutProps {
  wrapper?: (content: React.ReactNode) => React.ReactNode;
  children?: React.ReactNode;
}

export function ProjectOverviewLayout({
  children,
  redirectPaths,
  navigationMenus,
  forwardedTo,
  wrapper,
}: ProjectOverviewLayoutProps) {
  const content = (
    <DashboardLayoutProvider isOpen={true} persist>
      <div className="flex w-full overflow-hidden">
        <SidebarMenuDesktop
          redirectPaths={redirectPaths}
          navigationMenus={navigationMenus}
        />
        <div className="flex h-screen min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <DashboardHeader
            redirectPaths={redirectPaths}
            navigationMenus={navigationMenus}
            forwardedTo={forwardedTo}
          />
          <div className="relative flex min-h-0 w-full flex-1 overflow-hidden bg-[hsl(var(--surface-app))]">
            <div className="min-h-0 w-full flex-1 overflow-y-auto overflow-x-hidden">
              {children}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayoutProvider>
  );

  return (
    <ImpersonationChecker>
      <ImpersonationTerminator>
        {wrapper ? wrapper(content) : content}
      </ImpersonationTerminator>
    </ImpersonationChecker>
  );
}
