import { ConsoleHeader } from "@/components/common/console-header/console-header";
import type * as React from "react";

export interface ConsoleLayoutProps {
  children: React.ReactNode;
}

export function ConsoleLayout({ children }: ConsoleLayoutProps) {
  return (
    <div className="relative min-h-screen bg-[hsl(var(--surface-app))]">
      <ConsoleHeader />
      <main className={"pt-[59px]"}>{children}</main>
    </div>
  );
}
