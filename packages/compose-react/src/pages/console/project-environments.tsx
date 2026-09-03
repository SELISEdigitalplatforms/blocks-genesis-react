import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/core/popover/popover";
import type { IProject } from "@/models";
import { useProjectStore } from "@/store/project.store";
import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router";
import { getEnvironmentLabel } from "./project-list-utils";

const INLINE_LIMIT = 3;

type ProjectEnvironmentsProps = {
  projects: IProject[];
};

export const ProjectEnvironments = ({ projects }: ProjectEnvironmentsProps) => {
  const navigate = useNavigate();
  const { setTenantGroup, setSelectedProject } = useProjectStore();

  const onEnvironmentClick = async (
    event: React.MouseEvent,
    project: IProject,
  ) => {
    event.stopPropagation();
    try {
      setTenantGroup(project.tenantGroupId);
      setSelectedProject(project);
      navigate(`/app/${project.itemId}/dashboard`);
    } catch (error) {
      console.error("Failed to switch environment", error);
    }
  };

  const renderEnvironmentChip = (project: IProject) => (
    <button
      key={project.environment}
      type="button"
      onClick={(event) => onEnvironmentClick(event, project)}
      className="group/chip border-primary bg-primary text-primary-foreground hover:text-primary inline-flex cursor-pointer items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-all duration-150 hover:border-blocks-primary-50 hover:bg-blocks-primary-25 active:scale-95"
    >
      {getEnvironmentLabel(project.environment)}
      <ChevronRight className="h-3 w-3 transition-all duration-150 group-hover/chip:translate-x-0.5" />
    </button>
  );

  if (projects.length === 0) {
    return (
      <span className="border-border/60 bg-muted/40 text-muted-foreground inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs">
        No environments
      </span>
    );
  }

  const hasOverflow = projects.length > INLINE_LIMIT;
  const visibleProjects = hasOverflow
    ? projects.slice(0, INLINE_LIMIT)
    : projects;
  const overflowCount = projects.length - INLINE_LIMIT;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {visibleProjects.map(renderEnvironmentChip)}
      {hasOverflow && (
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              onClick={(event) => event.stopPropagation()}
              className="border-border/60 bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground inline-flex cursor-pointer items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors"
            >
              +{overflowCount} more
            </button>
          </PopoverTrigger>
          <PopoverContent
            className="w-52 p-1.5"
            align="start"
            onClick={(event) => event.stopPropagation()}
          >
            <p className="text-muted-foreground px-2 pb-1.5 pt-1 text-[10px] font-semibold uppercase tracking-wider">
              All environments
            </p>
            {projects.map((project) => (
              <button
                key={project.environment}
                type="button"
                onClick={(event) => onEnvironmentClick(event, project)}
                className="group/item hover:bg-accent flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors"
              >
                <span className="font-medium">
                  {getEnvironmentLabel(project.environment)}
                </span>
                <ChevronRight className="text-muted-foreground group-hover/item:text-foreground h-3.5 w-3.5 transition-transform duration-150 group-hover/item:translate-x-0.5" />
              </button>
            ))}
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
};
