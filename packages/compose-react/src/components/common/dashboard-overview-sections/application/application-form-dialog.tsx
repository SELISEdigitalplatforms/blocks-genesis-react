import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components";
import type { IApplication } from "@/models/project.model";
import { ApplicationForm } from "./application-form";

interface ApplicationFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /**
   * Pass an existing application to enter edit mode.
   * Omit (or pass null/undefined) for add mode.
   */
  application?: IApplication | null;
}

export const ApplicationFormDialog = ({
  open,
  onOpenChange,
  application,
}: ApplicationFormDialogProps) => {
  const isEditMode = !!application;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Application" : "Add Application"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update the domain configuration for this application."
              : "Add a new application domain to this project."}
          </DialogDescription>
        </DialogHeader>
        <ApplicationForm
          application={application}
          onAfterSubmit={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
};
