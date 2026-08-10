import { DashboardHeader, SidebarMenuDesktop } from "@/components";
import { RightSidePanelProvider } from "@/components/core/right-side-panel";
import {
  ImpersonationChecker,
  ImpersonationSynchronizer,
} from "@/guards/impersonation.guard";
import type * as React from "react";
import type { LayoutProps } from "./layout.types";
import { DashboardLayoutProvider } from "@/providers/dashboard-layout.provider";

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
    <DashboardLayoutProvider isOpen={true}>
      <RightSidePanelProvider resizable topOffset="60px">
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
              <div
                data-slot="dashboard-main"
                className="min-h-0 w-full flex-1 overflow-y-auto overflow-x-hidden transition-[margin] duration-300 ease-in-out lg:mr-[var(--right-side-panel-width)]"
              >
                {children}
              </div>
            </div>
          </div>
        </div>
      </RightSidePanelProvider>
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
