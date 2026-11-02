import { useT } from "@/i18n";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components";
import type { IDomain } from "@/models/project.model";
import { DomainForm } from "./domain-form";

interface DomainFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /**
   * Pass an existing application to enter edit mode.
   * Omit (or pass null/undefined) for add mode.
   */
  application?: IDomain | null;
}

export const DomainFormDialog = ({
  open,
  onOpenChange,
  application,
}: DomainFormDialogProps) => {
  const { t } = useT("genesis.dashboard");
  const isEditMode = !!application;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditMode
              ? t("DOMAIN_FORM_DIALOG.EDIT_TITLE")
              : t("DOMAIN_FORM_DIALOG.ADD_TITLE")}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? t("DOMAIN_FORM_DIALOG.EDIT_DESCRIPTION")
              : t("DOMAIN_FORM_DIALOG.ADD_DESCRIPTION")}
          </DialogDescription>
        </DialogHeader>
        <DomainForm
          application={application}
          onAfterSubmit={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
};
