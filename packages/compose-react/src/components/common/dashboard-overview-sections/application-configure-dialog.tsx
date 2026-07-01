import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components";
import { CnameValidatorProject, EditProject } from "@/components";
import type { IApplication } from "@/models/project.model";

interface ApplicationConfigureDialogProps {
  application: IApplication | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Mirrors EditProject's dialog shell but is controlled externally so the
 * applications table can open it for any row. Since this dialog is only
 * reachable when isDomainVerified is false, the CNAME error banner is
 * always shown.
 *
 * Note: EditProjectForm reads the active project from the store. If it ever
 * needs the specific per-row domain/cookieDomain passed as explicit props,
 * wire them in here.
 */
export const ApplicationConfigureDialog = ({
  application,
  open,
  onOpenChange,
}: ApplicationConfigureDialogProps) => {
  if (!application) return null;

  const showCnameBanner = application.cookieDomain !== "blocksdevelopers.com";
  const editFormData = {
    applicationDomain: application.domain,
    cookieDomain: application.cookieDomain,
    name: "",
    useCustomDomain: false,
    customDomain: "",
    isCookieEnable: true,
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Configure domain</DialogTitle>
          {showCnameBanner && (
            <div className="flex flex-col items-center justify-between gap-1 rounded-sm border border-base-error bg-blocks-error-100 px-4 py-4 text-base font-normal text-blocks-error-800 md:flex-row">
              <p>No servers found for &apos;{application.cookieDomain}&apos;</p>
              <div className="flex items-center gap-2">
                <CnameValidatorProject />
              </div>
            </div>
          )}
          <DialogDescription>
            Configure your domain to point to your application
          </DialogDescription>
        </DialogHeader>
        <EditProject data={editFormData} />
      </DialogContent>
    </Dialog>
  );
};
