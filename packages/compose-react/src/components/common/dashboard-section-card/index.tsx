import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface DashboardSectionCardProps {
  title: string;
  description?: string;
  headerRight?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}

/**
 * Shared shell for the dashboard overview cards (Project Details, Core APIs,
 * App Integration). Mirrors ServiceGroupCard's header markup minus the
 * selection/collapse/action affordances, so all three cards read as one
 * consistent system.
 */
export const DashboardSectionCard = ({
  title,
  description,
  headerRight,
  children,
  className,
  contentClassName,
}: DashboardSectionCardProps) => {
  return (
    <div className={cn("rounded-lg border border-border bg-card", className)}>
      <div className="flex items-center gap-2 px-3 py-2.5 sm:gap-3 sm:px-4 sm:py-3">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold leading-snug text-high-emphasis sm:text-base">
            {title}
          </h3>
          {description && (
            <p className="truncate text-[10px] text-muted-foreground sm:text-[11px]">
              {description}
            </p>
          )}
        </div>
        {headerRight && (
          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            {headerRight}
          </div>
        )}
      </div>
      <div
        className={cn(
          "border-t border-border px-2 py-2 sm:px-4 sm:py-3",
          contentClassName,
        )}>
        {children}
      </div>
    </div>
  );
};
