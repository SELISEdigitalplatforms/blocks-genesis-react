import { Button } from "@/components/core/button/button";
import { Card, CardTitle } from "@/components/core/card/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/core/popover/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/core/tooltip/tooltip";
import { environmentOptions } from "@/constants/environment-options";
import { useStartImpersonation } from "@/hooks/use-impersonation";
import type { IProject } from "@/models";
import { useProjectStore } from "@/store/project.store";
import { ChevronRight, Settings2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useProjectOverviewRedirect } from "./use-project-overview-redirect";

const INLINE_LIMIT = 3;

type ProjectCardProps = {
  project: IProject;
  projects: IProject[];
};

export const ProjectCard = ({ project, projects }: ProjectCardProps) => {
  const navigate = useNavigate();
  const { setTenantGroup, setSelectedProject } = useProjectStore();
  const { mutateAsync: startImpersonation } = useStartImpersonation();
  const { handleClick, isDisabled, isFetching } = useProjectOverviewRedirect({
    tenantGroupId: project.tenantGroupId,
  });

  const onConfigureClick = () => {
    setTenantGroup(project.tenantGroupId);
    handleClick();
  };

  const onEnvBadgeClick = async (e: React.MouseEvent, envProject: IProject) => {
    e.stopPropagation();
    try {
      // Start impersonation for the target env (a clean start — this card lives
      // on the console where impersonation is terminated). The dashboard's
      // ImpersonationChecker/Synchronizer hydrate the impersonated context after
      // navigation, so no full page reload is needed. Reloading here can abort
      // an in-flight refresh-token rotation, orphaning the rotating RT cookie
      // and 401'ing the later `stop` call.
      await startImpersonation({ targeted_tenant_id: envProject.tenantId });
      setTenantGroup(envProject.tenantGroupId);
      setSelectedProject(envProject);
      navigate(`/app/${envProject.itemId}/dashboard`);
    } catch (err) {
      console.error("Failed to switch environment", err);
    }
  };

  const renderEnvChip = (envProject: IProject) => {
    const label = environmentOptions.find(
      (o) => o.value === envProject.environment,
    )?.label;
    return (
      <button
        key={envProject.environment}
        onClick={(e) => onEnvBadgeClick(e, envProject)}
        className="group/chip border-primary bg-primary text-primary-foreground hover:text-primary inline-flex cursor-pointer items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-all duration-150 hover:border-blocks-primary-50 hover:bg-blocks-primary-25 active:scale-95"
      >
        {label}
        <ChevronRight className="h-3 w-3 transition-all duration-150 group-hover/chip:translate-x-0.5" />
      </button>
    );
  };

  const hasOverflow = projects.length > INLINE_LIMIT;
  const visibleProjects = hasOverflow
    ? projects.slice(0, INLINE_LIMIT)
    : projects;
  const overflowCount = projects.length - INLINE_LIMIT;

  return (
    <Card className="border-border/60 bg-card hover:border-primary/30 group flex h-40 flex-col overflow-hidden rounded-xl border p-4 shadow-sm transition-all duration-200 hover:shadow-md">
      <div className="relative flex items-start justify-between gap-2">
        <CardTitle className="line-clamp-3 flex-1 break-all pr-2 text-base font-semibold leading-snug">
          {project.name}
        </CardTitle>
        <div className="absolute right-0 top-0">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-primary hover:bg-primary/10 h-8 w-8 shrink-0 transition-colors"
                  disabled={isDisabled || isFetching}
                  onClick={onConfigureClick}
                >
                  <Settings2 size={16} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Configure Project</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      <div className="mt-auto">
        {projects.length === 0 ? (
          <span className="border-border/60 bg-muted/40 text-muted-foreground inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs">
            No environments
          </span>
        ) : (
          <div className="flex flex-wrap items-center gap-1.5">
            {visibleProjects.map((p) => renderEnvChip(p))}
            {hasOverflow && (
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    onClick={(e) => e.stopPropagation()}
                    className="border-border/60 bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground inline-flex cursor-pointer items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors"
                  >
                    +{overflowCount} more
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-52 p-1.5"
                  align="start"
                  onClick={(e) => e.stopPropagation()}
                >
                  <p className="text-muted-foreground px-2 pb-1.5 pt-1 text-[10px] font-semibold uppercase tracking-wider">
                    All environments
                  </p>
                  {projects.map((p) => {
                    const opt = environmentOptions.find(
                      (o) => o.value === p.environment,
                    );
                    return (
                      <button
                        key={p.environment}
                        onClick={(e) => onEnvBadgeClick(e, p)}
                        className="group/item hover:bg-accent flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors"
                      >
                        <span className="font-medium">
                          {opt?.label ?? p.environment}
                        </span>
                        <ChevronRight className="text-muted-foreground group-hover/item:text-foreground h-3.5 w-3.5 transition-transform duration-150 group-hover/item:translate-x-0.5" />
                      </button>
                    );
                  })}
                </PopoverContent>
              </Popover>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};
