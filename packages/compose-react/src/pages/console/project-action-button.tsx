import { Button } from "@/components/core/button/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/core/tooltip/tooltip";
import type { IProject } from "@/models";
import { useProjectStore } from "@/store/project.store";
import { Settings2 } from "lucide-react";
import { useProjectOverviewRedirect } from "./use-project-overview-redirect";

type ProjectActionButtonProps = {
  project: IProject;
  isShared: boolean;
  canOpen?: boolean;
};

export const ProjectActionButton = ({
  project,
  isShared,
  canOpen = true,
}: ProjectActionButtonProps) => {
  const { setTenantGroup } = useProjectStore();
  const { handleClick, isDisabled, isFetching } = useProjectOverviewRedirect({
    tenantGroupId: project.tenantGroupId,
  });

  const isActionDisabled = !canOpen || isDisabled || isFetching;
  const accessibleLabel = !canOpen
    ? "Project access unavailable"
    : isShared
      ? "Open shared project"
      : "Configure project";
  const tooltipLabel = !canOpen
    ? "Project access unavailable"
    : isShared
      ? "Open Project"
      : "Configure Project";

  const onClick = () => {
    setTenantGroup(project.tenantGroupId);
    handleClick();
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          size="icon"
          data-testid={
            isShared ? "project-card-open-shared" : "project-card-configure"
          }
          variant="ghost"
          className="text-primary hover:bg-primary/10 h-8 w-8 shrink-0 transition-colors"
          disabled={isActionDisabled}
          onClick={onClick}
          aria-label={accessibleLabel}
        >
          <Settings2 size={16} />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{tooltipLabel}</TooltipContent>
    </Tooltip>
  );
};
