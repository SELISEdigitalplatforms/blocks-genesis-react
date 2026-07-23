import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Badge } from "@/components/core/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/core/collapsible";
import { cn } from "@/lib/utils";
import { CoreApiEndpointRow } from "./core-api-endpoint-row";
import type { ICoreApiEndpoint } from "./core-api-endpoint.model";

interface CoreApiGroupSectionProps {
  tag: string;
  endpoints: ICoreApiEndpoint[];
  xBlocksKey?: string;
}

export const CoreApiGroupSection = ({
  tag,
  endpoints,
  xBlocksKey,
}: CoreApiGroupSectionProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className="rounded-md border border-border-default">
        <CollapsibleTrigger asChild>
          <button className="flex w-full items-center gap-2 px-3 py-2 text-left">
            <span className="flex-1 truncate text-sm font-medium text-high-emphasis">
              {tag}
            </span>
            <Badge className="shrink-0 rounded-full bg-primary/10 font-mono text-xs text-primary pointer-events-none">
              {endpoints.length}
            </Badge>
            <ChevronDown
              className={cn(
                "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
                open && "rotate-180",
              )}
            />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="flex flex-col gap-1.5 border-t border-border-default px-2 py-2">
            {endpoints.map((endpoint) => (
              <CoreApiEndpointRow
                key={endpoint.itemId}
                endpoint={endpoint}
                xBlocksKey={xBlocksKey}
              />
            ))}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};
