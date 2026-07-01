import { useState } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Settings, Trash2 } from "lucide-react";
import { Button, Dialog } from "@/components";
import ConfirmationModal from "@/components/common/confirmation-modal";
import { cn } from "@/lib/utils";
import { ApplicationConfigureDialog } from "./application-configure-dialog";
import type { IApplication } from "@/models/project.model";

// ─── Status badge ────────────────────────────────────────────────────────────

const StatusBadge = ({ verified }: { verified: boolean }) =>
  verified ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800">
      ✓ Verified
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
      Unverified
    </span>
  );

// ─── Column definitions ───────────────────────────────────────────────────────

const columnHelper = createColumnHelper<IApplication>();

const buildColumns = (
  onConfigure: (app: IApplication) => void,
  onDeleteRequest: (app: IApplication) => void,
) => [
  columnHelper.accessor("domain", {
    header: "Domain",
    cell: (info) => (
      <span className="text-sm text-high-emphasis">{info.getValue()}</span>
    ),
  }),
  columnHelper.accessor("isDomainVerified", {
    header: "Status",
    cell: (info) => <StatusBadge verified={info.getValue()} />,
  }),
  columnHelper.accessor("cookieDomain", {
    header: "Cookie Domain",
    cell: (info) => (
      <span className="text-sm text-muted-foreground">{info.getValue()}</span>
    ),
  }),
  columnHelper.display({
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const app = row.original;
      return (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            title="Delete application"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => onDeleteRequest(app)}>
            <Trash2 className="h-4 w-4" />
          </Button>
          {!app.isDomainVerified && (
            <Button
              variant="ghost"
              size="icon"
              title="Configure domain"
              onClick={() => onConfigure(app)}>
              <Settings className="h-4 w-4" />
            </Button>
          )}
        </div>
      );
    },
  }),
];

// ─── Component ────────────────────────────────────────────────────────────────

interface ApplicationsTableProps {
  data: IApplication[];
  /** Called after the user confirms deletion; parent owns the mutation */
  onDelete?: (application: IApplication) => void;
}

export const ApplicationsTable = ({
  data,
  onDelete,
}: ApplicationsTableProps) => {
  const [deleteTarget, setDeleteTarget] = useState<IApplication | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [configureTarget, setConfigureTarget] = useState<IApplication | null>(
    null,
  );
  const [configureDialogOpen, setConfigureDialogOpen] = useState(false);

  const handleDeleteRequest = (app: IApplication) => {
    setDeleteTarget(app);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (deleteTarget) onDelete?.(deleteTarget);
    setDeleteDialogOpen(false);
    setDeleteTarget(null);
  };

  const handleConfigure = (app: IApplication) => {
    setConfigureTarget(app);
    setConfigureDialogOpen(true);
  };

  const columns = buildColumns(handleConfigure, handleDeleteRequest);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <>
      {/* ── Delete confirmation ── */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <ConfirmationModal
          data={{
            dialogTitle: "Delete Application",
            dialogSubtitle: (
              <>
                Are you sure you want to delete{" "}
                <span className="font-semibold">{deleteTarget?.domain}</span>?
                This action cannot be undone.
              </>
            ),
            confirmButton: "Delete",
            cancelButton: "Cancel",
          }}
          onCancel={() => setDeleteDialogOpen(false)}
          onConfirm={handleDeleteConfirm}
        />
      </Dialog>

      {/* ── CNAME configure dialog ── */}
      <ApplicationConfigureDialog
        application={configureTarget}
        open={configureDialogOpen}
        onOpenChange={(open) => {
          setConfigureDialogOpen(open);
          if (!open) setConfigureTarget(null);
        }}
      />

      {/* ── Table ── */}
      <div className="relative w-full overflow-auto">
        <table className="w-full text-sm">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-border">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className={cn(
                      "h-12 px-4 text-left text-xs font-semibold uppercase tracking-wide text-medium-emphasis",
                      header.id === "actions" && "w-24",
                    )}>
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
                  className="py-8 text-center text-sm text-muted-foreground">
                  No applications configured yet.
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-border last:border-0 hover:bg-muted/50">
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
