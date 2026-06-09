import { ConsoleHeader } from "@/components/common/console-header/console-header";
import type * as React from "react";
// import {
//   ImpersonationChecker,
//   ImpersonationTerminator,
// } from "../guards/protected-guard";

export interface ConsoleLayoutProps {
  children: React.ReactNode;
}

export function ConsoleLayout({ children }: ConsoleLayoutProps) {
  return (
    // <ImpersonationChecker>
    //   <ImpersonationTerminator>
    <div className="relative min-h-screen bg-[hsl(var(--surface-app))]">
      <ConsoleHeader />
      <main className={"pt-[59px]"}>{children}</main>
    </div>
    //   </ImpersonationTerminator>
    // </ImpersonationChecker>
  );
}
