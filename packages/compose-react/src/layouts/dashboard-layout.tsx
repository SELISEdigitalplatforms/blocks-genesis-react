import type * as React from "react";
import { ProtectedGuard } from "../guards/protected-guard";

import { ImpersonationChecker, ImpersonationTerminator } from "../guards/impersonation-guard";

export interface DashboardLayoutProps {
  children?: React.ReactNode;
  sidebar?: React.ReactNode;
  header?: React.ReactNode;
  wrapper?: (content: React.ReactNode) => React.ReactNode;
}

export function DashboardLayout({ children, sidebar, header, wrapper }: DashboardLayoutProps) {
  const content = (
    <div className="relative flex h-screen bg-[hsl(var(--surface-app))]">
      {sidebar}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {header}
        <main className="flex-1 overflow-y-auto overflow-x-hidden">{children}</main>
      </div>
    </div>
  );

  return (
    <ProtectedGuard>
      <ImpersonationChecker>
        {/* <ImpersonationSynchronizer> */}
        {wrapper ? wrapper(content) : content}
        {/* </ImpersonationSynchronizer> */}
      </ImpersonationChecker>
    </ProtectedGuard>
  );
}
