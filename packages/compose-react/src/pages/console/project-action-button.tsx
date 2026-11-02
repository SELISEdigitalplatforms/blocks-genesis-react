import { Button } from "@/components/core/button/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/core/tooltip/tooltip";
import { useT, type TFunction } from "@/i18n";
import type { IProject } from "@/models";
import { useProjectStore } from "@/store/project.store";
import { Settings2 } from "lucide-react";
import { useProjectOverviewRedirect } from "./use-project-overview-redirect";

type ProjectActionButtonProps = {
  project: IProject;
  isShared: boolean;
  canOpen?: boolean;
};

const getActionLabels = (t: TFunction, canOpen: boolean, isShared: boolean) => {
  if (canOpen) {
    return isShared
      ? {
          accessibleLabel: t("PROJECT_ACTION_BUTTON.OPEN_SHARED_ARIA"),
          tooltipLabel: t("PROJECT_ACTION_BUTTON.OPEN_SHARED_TOOLTIP"),
        }
      : {
          accessibleLabel: t("PROJECT_ACTION_BUTTON.CONFIGURE_ARIA"),
          tooltipLabel: t("PROJECT_ACTION_BUTTON.CONFIGURE_TOOLTIP"),
        };
  }
  return {
    accessibleLabel: t("PROJECT_ACTION_BUTTON.ACCESS_UNAVAILABLE"),
    tooltipLabel: t("PROJECT_ACTION_BUTTON.ACCESS_UNAVAILABLE"),
  };
};

export const ProjectActionButton = ({
  project,
  isShared,
  canOpen = true,
}: ProjectActionButtonProps) => {
  const { t } = useT("genesis.console");
  const { setTenantGroup } = useProjectStore();
  const { handleClick, isDisabled, isFetching } = useProjectOverviewRedirect({
    tenantGroupId: project.tenantGroupId,
  });

  const isActionDisabled = !canOpen || isDisabled || isFetching;
  const { accessibleLabel, tooltipLabel } = getActionLabels(
    t,
    canOpen,
    isShared,
  );

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
