import { Button, Dialog, RenderConditionally, toast } from "@/components";
import ConfirmationModal from "@/components/common/confirmation-modal";
import { useUpdateProject } from "@/hooks/use-project";
import { cn } from "@/lib/utils";
import type { IApplication } from "@/models/project.model";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Settings, Trash2 } from "lucide-react";
import { useState } from "react";
import { ApplicationFormDialog } from "./application-form-dialog";
import { ApplicationAction } from "./application.constant";

// ─── Status badge ─────────────────────────────────────────────────────────────

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

// ─── Column helper ────────────────────────────────────────────────────────────

const columnHelper = createColumnHelper<IApplication>();

const buildColumns = (
  onEdit: (app: IApplication) => void,
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
            onClick={() => onDeleteRequest(app)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          {/* Configure — only visible when domain is not yet verified */}
          <RenderConditionally condition={!app.isDomainVerified}>
            <Button
              variant="ghost"
              size="icon"
              title="Configure domain"
              onClick={() => onEdit(app)}
            >
              <Settings className="h-4 w-4 text-muted-foreground" />
            </Button>
          </RenderConditionally>
        </div>
      );
    },
  }),
];

// ─── Component ────────────────────────────────────────────────────────────────

interface ApplicationsTableProps {
  data: IApplication[];
}

export const ApplicationsTable = ({ data }: ApplicationsTableProps) => {
  const { mutateAsync, isPending } = useUpdateProject();

  // ── Edit dialog ────────────────────────────────────────────────────────────
  const [editTarget, setEditTarget] = useState<IApplication | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const handleEdit = (app: IApplication) => {
    setEditTarget(app);
    setEditDialogOpen(true);
  };

  // ── Delete dialog ──────────────────────────────────────────────────────────
  const [deleteTarget, setDeleteTarget] = useState<IApplication | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleDeleteRequest = (app: IApplication) => {
    setDeleteTarget(app);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      const res = await mutateAsync({
        action: ApplicationAction.Delete,
        application: deleteTarget,
        applicationDomain: deleteTarget.domain,
      });
      if (res.isSuccess) {
        toast.success("Application deleted successfully");
      } else {
        toast.error(res.errors as string);
      }
    } catch {
      toast.error("Failed to delete application");
    } finally {
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
    }
  };

  // ── Table ──────────────────────────────────────────────────────────────────
  const columns = buildColumns(handleEdit, handleDeleteRequest);
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <>
      {/* Edit dialog — one instance, target swaps per row */}
      <ApplicationFormDialog
        open={editDialogOpen}
        application={editTarget}
        onOpenChange={(open) => {
          setEditDialogOpen(open);
          if (!open) setEditTarget(null);
        }}
      />

      {/* Delete confirmation — one instance, target swaps per row */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <ConfirmationModal
          data={{
            dialogTitle: "Delete Application",
            dialogSubtitle: (
              <>
                Are you sure you want to delete{" "}
                <span className="font-semibold break-all">
                  {deleteTarget?.domain}
                </span>
                ? This action cannot be undone.
              </>
            ),
            confirmButton: "Delete",
            cancelButton: "Cancel",
          }}
          onCancel={() => setDeleteDialogOpen(false)}
          onConfirm={handleDeleteConfirm}
          buttonState={{ confirm: { disable: isPending } }}
        />
      </Dialog>

      {/* Table */}
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
                  No applications configured yet.
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
