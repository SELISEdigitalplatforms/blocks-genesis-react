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
import { useUpdateTenantGroup } from "@/hooks/use-project";
import { useQueryClient } from "@tanstack/react-query";
import { useProjectStore } from "@/store";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import type { IDomain } from "@/models/project.model";
import type { IEnvRepository } from "@/models";

interface SetCustomDomainDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  repo: IEnvRepository | null;
  domains: IDomain[];
  projectName?: string;
}

export const SetCustomDomainDialog = ({
  open,
  onOpenChange,
  repo,
  domains,
  projectName,
}: SetCustomDomainDialogProps) => {
  const queryClient = useQueryClient();
  const itemId = useProjectStore().selectedProject?.itemId || "";
  const { mutateAsync, isPending } = useUpdateTenantGroup();
  const [selectedDomain, setSelectedDomain] = useState<string>("");

  useEffect(() => {
    if (open) {
      setSelectedDomain(repo?.customDeploymentUrl || "");
    }
  }, [open, repo]);

  const handleSave = async () => {
    if (!repo || !selectedDomain) return;
    try {
      // NOTE: placeholder mutation shape — logic/endpoint will change later
      const res = await mutateAsync({
        name: projectName ?? "",
        tenantGroupId: itemId,
      });
      if (res.isSuccess) {
        showSuccessToast({ description: "Custom domain updated successfully" });
        queryClient.invalidateQueries({
          queryKey: ["identifier", "project", { projectId: itemId }],
        });
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

        <Select value={selectedDomain} onValueChange={setSelectedDomain}>
          <SelectTrigger>
            <SelectValue placeholder="Select a domain" />
          </SelectTrigger>
          <SelectContent>
            {domains.map((d) => (
              <SelectItem key={d.domain} value={d.domain}>
                {d.domain}
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
