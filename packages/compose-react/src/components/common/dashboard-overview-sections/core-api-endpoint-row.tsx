import { Terminal } from "lucide-react";
import { CopyToClipboardButton } from "@/index";
import { cn } from "@/lib/utils";
import { buildCurlCommand } from "./util";
import type { HttpMethod, ICoreApiEndpoint } from "./core-api-endpoint.model";

const METHOD_BADGE_CLASSES: Record<HttpMethod, string> = {
  GET: "bg-blue-50 text-blue-700",
  POST: "bg-green-100 text-green-800",
  PUT: "bg-amber-100 text-amber-800",
  PATCH: "bg-amber-100 text-amber-800",
  DELETE: "bg-red-100 text-red-800",
};

interface CoreApiEndpointRowProps {
  endpoint: ICoreApiEndpoint;
  /** Injected into the copied curl command's X-Blocks-Key header */
  xBlocksKey?: string;
}

export const CoreApiEndpointRow = ({
  endpoint,
  xBlocksKey,
}: CoreApiEndpointRowProps) => {
  const curlCommand = buildCurlCommand(endpoint, xBlocksKey);

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
        <div className="truncate font-mono text-xs text-low-emphasis">
          {endpoint.path}
        </div>
      </div>
      <CopyToClipboardButton textToCopy={curlCommand} isHoverable>
        <span className="flex shrink-0 items-center gap-1 whitespace-nowrap text-xs text-muted-foreground">
          <Terminal className="h-3.5 w-3.5" />
          Copy as cURL
        </span>
      </CopyToClipboardButton>
    </div>
  );
};
