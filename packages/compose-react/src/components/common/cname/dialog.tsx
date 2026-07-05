import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components";
import type { IDomain } from "@/models/project.model";
import { CnameValidatorProject } from "./validator-project";

interface CnameValidatorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  domain: IDomain | null;
}

export const CnameValidatorDialog = ({
  open,
  onOpenChange,
  domain,
}: CnameValidatorDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Validate Domain</DialogTitle>
          <DialogDescription>
            Run a CNAME lookup to verify your domain configuration.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {/* Domain info summary */}
          <div className="space-y-3 rounded-md border border-border bg-muted/30 px-4 py-3">
            <div className="space-y-0.5">
              <p className="text-xs font-semibold uppercase tracking-wide text-medium-emphasis">
                Domain
              </p>
              <p className="break-all text-sm font-medium text-high-emphasis">
                {domain?.domain}
              </p>
            </div>
            <div className="space-y-0.5">
              <p className="text-xs font-semibold uppercase tracking-wide text-medium-emphasis">
                Cookie Domain
              </p>
              <p className="text-sm text-muted-foreground">
                {domain?.cookieDomain}
              </p>
            </div>
          </div>

          {/* Error banner — shown when the cookie domain is not the default
              blocksdevelopers.com, matching the pattern from EditProject */}
          {domain && domain.cookieDomain !== "blocksdevelopers.com" && (
            <div className="flex flex-col gap-1 rounded-sm border border-base-error bg-blocks-error-100 px-4 py-3 text-sm font-normal text-blocks-error-800">
              <p>
                No servers found for &apos;{domain.cookieDomain}&apos;. Run a
                CNAME lookup to check your DNS configuration.
              </p>
            </div>
          )}

          <div className="flex justify-end">
            <CnameValidatorProject
              isDomainVerified={domain?.isDomainVerified ?? false}
              cookieDomain={domain?.cookieDomain ?? ""}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
