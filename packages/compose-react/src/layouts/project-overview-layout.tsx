import type * as React from "react";
import { ProtectedGuard } from "../guards/protected-guard";

import { ImpersonationChecker, ImpersonationTerminator } from "../guards/impersonation-guard";

export interface ProjectOverviewLayoutProps {
  children?: React.ReactNode;
  sidebar?: React.ReactNode;
  header?: React.ReactNode;
  wrapper?: (content: React.ReactNode) => React.ReactNode;
}

export function ProjectOverviewLayout({
  children,
  sidebar,
  header,
  wrapper,
}: ProjectOverviewLayoutProps) {
  const content = (
    <div className="relative flex h-screen overflow-hidden bg-[hsl(var(--surface-app))]">
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
        <ImpersonationTerminator>{wrapper ? wrapper(content) : content}</ImpersonationTerminator>
      </ImpersonationChecker>
    </ProtectedGuard>
  );
}
