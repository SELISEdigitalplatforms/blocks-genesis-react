import { Suspense } from "react";
import type * as React from "react";
import { PublicGuard } from "../guards/public-guard";

interface AuthLayoutProps {
  children?: React.ReactNode;
  logo?: React.ReactNode;
  sidePanel?: React.ReactNode;
}

export function AuthLayout({ children, logo, sidePanel }: AuthLayoutProps) {
  return (
    <Suspense>
      <PublicGuard>
        <div className="flex min-h-screen flex-col items-center px-6 py-10 lg:px-12">
          {logo}
          <div className="mt-10 flex w-full max-w-6xl flex-col gap-8 lg:flex-row lg:items-start lg:justify-center">
            <div className="w-full max-w-xl">{children}</div>
            {sidePanel ? <div className="w-full max-w-xl">{sidePanel}</div> : null}
          </div>
        </div>
      </PublicGuard>
    </Suspense>
  );
}
