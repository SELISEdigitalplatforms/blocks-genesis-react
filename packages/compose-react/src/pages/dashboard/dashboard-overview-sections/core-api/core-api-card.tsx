import { Skeleton } from "@/index";
import { Badge } from "@/components";
import { CoreApiGroupSection } from "./core-api-group-section";
import { DashboardSectionCard } from "../dashboard-section-card";
import type { ICoreApiEndpoint } from "./core-api-endpoint.model";
import { groupEndpointsByTag } from "../util";

interface CoreApiCardProps {
  title?: string;
  description?: string;
  endpoints: ICoreApiEndpoint[];
  /** Forwarded into each endpoint's "Copy as cURL" command */
  xBlocksKey?: string;
  isLoading?: boolean;
  error?: unknown;
}

const CoreApiLoadingSkeleton = () => (
  <div className="rounded-lg border border-border bg-card">
    <div className="px-3 py-2.5 sm:px-4 sm:py-3">
      <Skeleton className="h-4 w-28" />
    </div>
    <div className="flex flex-col gap-1.5 border-t border-border px-2 py-2 sm:px-4 sm:py-3">
      {Array.from({ length: 4 }).map((_item, index) => (
        <Skeleton key={index} className="h-10 w-full" />
      ))}
    </div>
  </div>
);

export const CoreApiCard = ({
  title = "Core APIs",
  description = "Available endpoints for this module",
  endpoints,
  xBlocksKey,
  isLoading,
  error,
}: CoreApiCardProps) => {
  if (isLoading) return <CoreApiLoadingSkeleton />;

  const groups = groupEndpointsByTag(endpoints);

  return (
    <DashboardSectionCard
      title={title}
      description={description}
      contentClassName="flex flex-col gap-2"
      headerRight={
        <>
          <Badge className="hidden rounded-full bg-primary/10 font-mono text-xs text-primary pointer-events-none sm:flex">
            {endpoints.length} Endpoint{endpoints.length !== 1 ? "s" : ""}
          </Badge>
          <span className="flex rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-mono font-medium text-primary pointer-events-none sm:hidden">
            {endpoints.length}
          </span>
        </>
      }
    >
      {groups.length === 0 ? (
        <p className="px-1 py-3 text-center text-sm text-muted-foreground">
          {error
            ? "Couldn't load endpoints for this module."
            : "No endpoints available for this module."}
        </p>
      ) : (
        groups.map((group) => (
          <CoreApiGroupSection
            key={group.tag}
            tag={group.tag}
            endpoints={group.endpoints}
            xBlocksKey={xBlocksKey}
          />
        ))
      )}
    </DashboardSectionCard>
  );
};
