import { DashboardHeader, SidebarMenuDesktop } from "@/components";
import {
  ImpersonationChecker,
  ImpersonationTerminator,
} from "@/guards/impersonation-guard";
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
      <div className="relative flex h-screen overflow-hidden bg-[hsl(var(--surface-app))]">
        <SidebarMenuDesktop
          redirectPaths={redirectPaths}
          navigationMenus={navigationMenus}
        />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <DashboardHeader
            redirectPaths={redirectPaths}
            navigationMenus={navigationMenus}
            forwardedTo={forwardedTo}
          />
          <main className="flex-1 overflow-y-auto overflow-x-hidden">
            {children}
          </main>
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
