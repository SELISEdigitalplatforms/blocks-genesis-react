import * as React from "react";

import { cn } from "@blocks/ui/lib/utils";

interface SectionProps {
  id: string;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Visual grouping primitive used to scaffold each showcase block.
 * Keeps spacing, heading hierarchy and anchor links consistent.
 */
export function Section({ id, title, description, children, className }: SectionProps) {
  return (
    <section id={id} className={cn("scroll-mt-24 space-y-4", className)}>
      <header className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight">
          <a href={`#${id}`} className="hover:underline">
            {title}
          </a>
        </h2>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </header>
      <div className="rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm">
        {children}
      </div>
    </section>
  );
}

interface RowProps {
  label?: string;
  children: React.ReactNode;
  className?: string;
}

/** Inline labelled row used to demonstrate component variants side by side. */
export function Row({ label, children, className }: RowProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {label ? (
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
      ) : null}
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  );
}
