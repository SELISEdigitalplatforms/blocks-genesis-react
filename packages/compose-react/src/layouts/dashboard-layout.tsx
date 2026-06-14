import { DashboardHeader, SidebarMenuDesktop } from "@/components";
import {
  ImpersonationChecker,
  ImpersonationSynchronizer,
} from "@/guards/impersonation-guard";
import type * as React from "react";
import type { LayoutProps } from "./layout.types";
import { DashboardLayoutProvider } from "@/contexts/dashboard-layout/dashboard-layout-provider";

export interface DashboardLayoutProps extends LayoutProps {
  children?: React.ReactNode;
  wrapper?: (content: React.ReactNode) => React.ReactNode;
}

export function DashboardLayout({
  children,
  wrapper,
  redirectPaths,
  navigationMenus,
  forwardedTo,
}: DashboardLayoutProps) {
  const content = (
    <DashboardLayoutProvider isOpen={true} persist>
      <div className="relative flex h-screen bg-[hsl(var(--surface-app))]">
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
      <ImpersonationSynchronizer>
        {wrapper ? wrapper(content) : content}
      </ImpersonationSynchronizer>
    </ImpersonationChecker>
  );
}
