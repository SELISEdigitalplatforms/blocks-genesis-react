import { useState, useEffect } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components";
import { useUpdateRepositories } from "@/hooks/use-project";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import type { IDomain } from "@/models/project.model";
import type { IEnvRepository } from "@/models";

interface SetCustomDomainDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  repo: IEnvRepository | null;
  domains: IDomain[];
  /** Tenant id of the project — sent as `projectKey` */
  projectKey: string;
  /** Environment of the project (e.g. "dev") — sent as `projectEnv` */
  projectEnv: string;
}

export const SetCustomDomainDialog = ({
  open,
  onOpenChange,
  repo,
  domains,
  projectKey,
  projectEnv,
}: SetCustomDomainDialogProps) => {
  const { mutateAsync, isPending } = useUpdateRepositories();
  const [selectedDomain, setSelectedDomain] = useState<string>("");

  // Only verified domains are assignable, and applications can contain the
  // same domain several times — dedupe, because duplicate Radix Select values
  // make SelectValue render every matching item's text concatenated
  const verifiedDomains = Array.from(
    new Set(domains.filter((d) => d.isDomainVerified).map((d) => d.domain)),
  );

  useEffect(() => {
    if (open) {
      setSelectedDomain(repo?.customDeploymentUrl || "");
    }
  }, [open, repo]);

  const handleSave = async () => {
    if (!repo || !selectedDomain) return;
    try {
      const res = await mutateAsync({
        projectKey,
        projectEnv,
        repoWithDomains: [
          {
            repoId: repo.itemId,
            repoUrl: repo.repoUrl,
            customDeploymentDomain: selectedDomain,
          },
        ],
      });
      if (res.isSuccess) {
        showSuccessToast({ description: "Custom domain updated successfully" });
        onOpenChange(false);
      } else {
        showErrorToast({ errors: res.errors });
      }
    } catch (error) {
      if (error && typeof error === "object" && "errors" in error) {
        showErrorToast({ errors: error.errors });
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set custom domain</DialogTitle>
          <DialogDescription>
            Choose a verified domain to assign to{" "}
            <span className="font-medium">{repo?.repoName}</span>
          </DialogDescription>
        </DialogHeader>

        <Select
          value={selectedDomain}
          onValueChange={setSelectedDomain}
          disabled={verifiedDomains.length === 0}
        >
          <SelectTrigger className="[&>span]:truncate [&>span]:text-left">
            <SelectValue
              placeholder={
                verifiedDomains.length === 0
                  ? "No verified domains available"
                  : "Select a domain"
              }
            />
          </SelectTrigger>
          {/* Cap the popover to the viewport and wrap long domains so the
              dropdown stays usable on small screens */}
          <SelectContent className="max-w-[calc(100vw-2rem)]">
            {verifiedDomains.map((domain) => (
              <SelectItem key={domain} value={domain} className="break-all">
                {domain}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={!selectedDomain || isPending} onClick={handleSave}>
            Set
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
