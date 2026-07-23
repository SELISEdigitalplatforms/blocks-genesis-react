import { ConsoleHeader } from "@/components/common/console-header/console-header";
import { ImpersonationChecker, ImpersonationTerminator } from "@/guards";
import type * as React from "react";

export interface ConsoleLayoutProps {
  children: React.ReactNode;
  wrapper?: (content: React.ReactNode) => React.ReactNode;
}

export function ConsoleLayout({ children, wrapper }: ConsoleLayoutProps) {
  const content = (
    <div className="relative min-h-screen bg-[hsl(var(--surface-app))]">
      <ConsoleHeader />
      <main className={"pt-[59px]"}>{children}</main>
    </div>
  );
  return (
    <ImpersonationChecker>
      <ImpersonationTerminator>
        {wrapper ? wrapper(content) : content}
      </ImpersonationTerminator>
    </ImpersonationChecker>
  );
}
