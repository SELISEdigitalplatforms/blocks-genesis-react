import { useT } from "@/i18n";
import { Button, Dialog, DialogTrigger } from "@/components";
import { useDisableProject } from "@/hooks/use-project";
import { isErrorWithErrors } from "@/utils/error";
import { useProjectStore } from "@/store";
import { Archive } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { ConfirmationModal } from "@/components/common/confirmation-modal";
import { showErrorToast, showSuccessToast } from "@/utils/toast";

export const ArchiveProject = () => {
  const { t } = useT("genesis.shared");
  const navigate = useNavigate();
  const projectKey = useProjectStore().selectedProject?.tenantId || "";
  const { mutateAsync, isPending } = useDisableProject({ projectKey });
  const onClickHandler = async () => {
    try {
      const res = await mutateAsync();
      if (res.isSuccess) {
        showSuccessToast({
          title: t("ARCHIVE_PROJECT.TOAST_TITLE"),
          description: t("ARCHIVE_PROJECT.TOAST_DESCRIPTION"),
        });
        navigate("/app/console");
      } else {
        showErrorToast({ errors: res.errors });
      }
    } catch (error) {
      if (isErrorWithErrors(error)) {
        showErrorToast({ errors: error.errors });
      }
    }
  };
  const [open, setOpen] = useState<boolean>(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="destructive"
          size="sm"
          className="flex items-center gap-2"
        >
          <Archive className="h-4 w-4" />
          <span className="sr-only sm:not-sr-only">{t("common:DELETE")}</span>
        </Button>
      </DialogTrigger>
      <ConfirmationModal
        onCancel={() => setOpen(false)}
        onConfirm={onClickHandler}
        data={{
          dialogTitle: t("ARCHIVE_PROJECT.DIALOG_TITLE"),
          dialogSubtitle: (
            <>
              <p>{t("ARCHIVE_PROJECT.CONFIRM")}</p>
              <p>{t("ARCHIVE_PROJECT.WARNING")}</p>
            </>
          ),
          confirmButton: t("common:DELETE"),
        }}
        buttonState={{ confirm: { disable: isPending } }}
      />
    </Dialog>
  );
};
