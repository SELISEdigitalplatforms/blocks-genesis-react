import {
  Button,
  CnameValidatorProject,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components";
import { formatFullDate } from "@/utils";
import { Settings } from "lucide-react";
import { useState } from "react";
import { EditProjectForm } from "./edit-project-form";
import type { EditProjectFormSchema } from "./schema";
interface EditProjectProps {
  data: EditProjectFormSchema;
  lastUpdatedDate?: string;
  isLoading?: boolean;
}
export const EditProject = ({ data, lastUpdatedDate }: EditProjectProps) => {
  const [open, setOpen] = useState<boolean>(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Settings className="h-4 w-4" />
          <span className="sr-only sm:not-sr-only sm:ml-2">Configure</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Configure domain</DialogTitle>
          {data?.cookieDomain !== "blocksdevelopers.com" && (
            <div className="flex flex-col items-center justify-between gap-1 rounded-sm border border-base-error bg-blocks-error-100 px-4 py-4 text-base font-normal text-blocks-error-800 md:flex-row">
              <p>No servers found for &apos;{data?.cookieDomain}&apos;</p>
              <div className="flex items-center gap-2">
                {lastUpdatedDate ? (
                  <p>Reported on {formatFullDate(new Date(lastUpdatedDate))}</p>
                ) : (
                  <p>Report date unavailable</p>
                )}
                <CnameValidatorProject />
              </div>
            </div>
          )}
          <DialogDescription>
            Configure your domain to point to your application
          </DialogDescription>
        </DialogHeader>
        <EditProjectForm formData={data} onAfterSubmit={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
};
