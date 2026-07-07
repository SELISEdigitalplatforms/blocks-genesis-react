import { Button } from "@/components";
import { formatFullDate } from "@/utils";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Pencil } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SetCustomDomainDialog } from "./set-custom-domain-dialog";
import type { IDomain } from "@/models/project.model";
import type { IEnvRepository } from "@/models";
import { cn } from "@/lib";

// ─── Column helper ────────────────────────────────────────────────────────────

const columnHelper = createColumnHelper<IEnvRepository>();

const buildColumns = (
  onSet: (repo: IEnvRepository) => void,
  onNavigate: (repoId: string) => void,
) => [
  columnHelper.accessor("repoName", {
    header: "Name",
    cell: (info) => (
      <span className="text-sm font-medium text-high-emphasis">
        {info.getValue()}
      </span>
    ),
  }),
  columnHelper.display({
    id: "deploymentDomain",
    header: "Deployment Domain",
    cell: ({ row }) => {
      const repo = row.original;
      const value =
        repo.customDeploymentUrl && repo.customDeploymentUrl !== ""
          ? repo.customDeploymentUrl
          : repo.defaultDeploymentUrl;
      return <span className="text-sm text-medium-emphasis">{value}</span>;
    },
  }),
  columnHelper.accessor("customDeploymentUrl", {
    header: "Custom Domain",
    cell: ({ row }) => {
      const repo = row.original;
      return repo.customDeploymentUrl ? (
        <span className="text-sm text-medium-emphasis">
          {repo.customDeploymentUrl}
        </span>
      ) : (
        <Button variant="outline" size="xxs" onClick={() => onSet(repo)}>
          <span className="px-2">Set</span>
        </Button>
      );
    },
  }),
  columnHelper.display({
    id: "lastDeploymentDate",
    header: "Last Deployment Date",
    cell: ({ row }) => {
      const repo = row.original;
      const isDefaultDate = repo.lastDeploymentDate === "0001-01-01T00:00:00";
      return (
        <div
          className="cursor-pointer text-sm text-blue-600 hover:text-blue-800 hover:underline"
          onClick={() => onNavigate(repo.itemId)}
        >
          {!repo.lastDeploymentDate || isDefaultDate
            ? "Not deployed"
            : formatFullDate(new Date(repo.lastDeploymentDate))}
        </div>
      );
    },
  }),
  columnHelper.display({
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const repo = row.original;
      const hasCustomDomain = !!repo.customDeploymentUrl;
      return (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            title="Edit custom domain"
            disabled={!hasCustomDomain}
            onClick={() => onSet(repo)}
          >
            <Pencil className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
      );
    },
  }),
];

// ─── Component ────────────────────────────────────────────────────────────────

interface ProjectRepoTableProps {
  data: IEnvRepository[];
  domains: IDomain[];
  /** Tenant id of the project — forwarded as `projectKey` */
  projectKey: string;
  /** Environment of the project (e.g. "dev") — forwarded as `projectEnv` */
  projectEnv: string;
}

export const ProjectRepoTable = ({
  data,
  domains,
  projectKey,
  projectEnv,
}: ProjectRepoTableProps) => {
  const navigate = useNavigate();

  // ── Set custom domain dialog ────────────────────────────────────────────────
  const [setTarget, setSetTarget] = useState<IEnvRepository | null>(null);
  const [setDialogOpen, setSetDialogOpen] = useState(false);

  const handleSet = (repo: IEnvRepository) => {
    setSetTarget(repo);
    setSetDialogOpen(true);
  };

  const handleNavigate = (repoId: string) => {
    navigate(`/devops/repo/${repoId}`);
  };

  // ── Table ──────────────────────────────────────────────────────────────────
  const columns = buildColumns(handleSet, handleNavigate);
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <>
      {/* Set custom domain dialog — one instance, target swaps per row */}
      <SetCustomDomainDialog
        open={setDialogOpen}
        onOpenChange={(open) => {
          setSetDialogOpen(open);
          if (!open) setSetTarget(null);
        }}
        repo={setTarget}
        domains={domains}
        projectKey={projectKey}
        projectEnv={projectEnv}
      />

      {/* Table */}
      <div className="relative w-full overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-border">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className={cn(
                      "h-12 px-4 text-left text-xs font-semibold uppercase tracking-wide text-medium-emphasis",
                      header.id === "actions" && "w-32",
                    )}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="py-10 text-center text-sm text-muted-foreground"
                >
                  No repositories found for this project.
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-border last:border-0 hover:bg-muted/50"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="p-2 md:px-4 md:py-3">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};
