import { Card, Skeleton } from "@/components/core";

export const ProjectCardLoadingSkeleton = () => {
  return (
    <Card className="border-border/60 bg-card flex h-40 flex-col overflow-hidden rounded-xl border p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="mt-1.5 h-4 w-3/5" />
        </div>
        <Skeleton className="h-8 w-8 flex-shrink-0 rounded-md" />
      </div>
      <div className="mt-auto flex flex-wrap gap-1.5">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
    </Card>
  );
};

/** Mirrors a list-view row: a compact `bg-card` bar rather than the grid tile's full card. */
export const ProjectListRowLoadingSkeleton = () => {
  return (
    <Card className="border-border/60 bg-card flex h-14 items-center gap-4 rounded-xl border px-4 py-2 shadow-sm">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-5 w-16 shrink-0 rounded-full" />
      <Skeleton className="ml-auto h-4 w-20 shrink-0" />
      <Skeleton className="h-8 w-8 shrink-0 rounded-md" />
    </Card>
  );
};
