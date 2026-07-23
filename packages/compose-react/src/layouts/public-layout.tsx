import { Suspense } from "react";
import type * as React from "react";
import { PublicGuard } from "../guards/public.guard";

export function PublicLayout({ children }: { children?: React.ReactNode }) {
  return (
    <Suspense>
      <PublicGuard>{children}</PublicGuard>
    </Suspense>
  );
}
