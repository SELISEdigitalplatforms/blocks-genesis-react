import { useT } from "@/i18n";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components";
import { EditProjectForm } from "./edit-project-form";

interface EditProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenantGroupId: string;
  currentName: string;
}

export const EditProjectDialog = ({
  open,
  onOpenChange,
  tenantGroupId,
  currentName,
}: EditProjectDialogProps) => {
  const { t } = useT("genesis.shared");
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("EDIT_PROJECT_DIALOG.TITLE")}</DialogTitle>
          <DialogDescription>
            {t("EDIT_PROJECT_DIALOG.DESCRIPTION")}
          </DialogDescription>
        </DialogHeader>
        <EditProjectForm
          tenantGroupId={tenantGroupId}
          currentName={currentName}
          onAfterSubmit={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
};
