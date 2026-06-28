import { CopyToClipboardButton } from "@/index";
import { cn } from "@/lib/utils";
import type { HttpMethod, ICoreApiEndpoint } from "./core-api-endpoint.model";

const METHOD_BADGE_CLASSES: Record<HttpMethod, string> = {
  GET: "bg-blue-50 text-blue-700",
  POST: "bg-green-100 text-green-800",
  PUT: "bg-amber-100 text-amber-800",
  PATCH: "bg-amber-100 text-amber-800",
  DELETE: "bg-red-100 text-red-800",
};

export const CoreApiEndpointRow = ({
  endpoint,
}: {
  endpoint: ICoreApiEndpoint;
}) => {
  return (
    <div className="flex flex-col gap-1 rounded-md border border-border-default px-3 py-2 sm:flex-row sm:items-center sm:gap-3">
      {endpoint.method && (
        <span
          className={cn(
            "w-fit shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase",
            METHOD_BADGE_CLASSES[endpoint.method],
          )}
        >
          {endpoint.method}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium text-high-emphasis">
          {endpoint.summary}
        </div>
        <CopyToClipboardButton textToCopy={endpoint.path} isHoverable>
          <span className="truncate font-mono text-xs text-low-emphasis">
            {endpoint.path}
          </span>
        </CopyToClipboardButton>
      </div>
    </div>
  );
};
