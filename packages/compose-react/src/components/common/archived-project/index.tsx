import { Button, Dialog, DialogTrigger, toast } from "@/components";
import { useDisableProject } from "@/hooks/use-project";
import { isErrorWithErrors } from "@/lib/error";
import { useProjectStore } from "@/store";
import { Archive } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ConfirmationModal from "../confirmation-modal";

export const ArchivedProject = () => {
  const navigate = useNavigate();
  const projectKey = useProjectStore().selectedProject?.tenantId || "";
  const { mutateAsync, isPending } = useDisableProject({ projectKey });
  const onClickHandler = async () => {
    try {
      const res = await mutateAsync();
      if (res.isSuccess) {
        toast.success("Project deleted successfully");
        navigate("/app/console");
      } else {
        toast.error(res.errors);
      }
    } catch (error) {
      if (isErrorWithErrors(error)) {
        toast.error(error.errors[0]);
      }
    }
  };
  const [open, setOpen] = useState<boolean>(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Archive className="h-4 w-4" />
          <span className="sr-only sm:not-sr-only sm:ml-2">Delete</span>
        </Button>
      </DialogTrigger>
      <ConfirmationModal
        onCancel={() => setOpen(false)}
        onConfirm={onClickHandler}
        data={{
          dialogTitle: "Delete this environment?",
          dialogSubtitle: (
            <>
              <p>Are you sure you want to delete this environment?</p>
              <p>
                This will permanently delete the environment and you&apos;ll
                need to contact support to recover it.
              </p>
            </>
          ),
          confirmButton: "Delete",
        }}
        buttonState={{ confirm: { disable: isPending } }}
      />
    </Dialog>
  );
};
