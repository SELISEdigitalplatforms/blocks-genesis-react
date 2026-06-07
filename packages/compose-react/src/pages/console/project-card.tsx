import { Card, CardTitle } from "@/components/core/card";
import { Button } from "@/components/core/button";
import { useNavigate } from "react-router-dom";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/components/core/tooltip";
// import { environmentOptions } from "@/constants/environment-options";
import { useProjectStore } from "@/store/project-store";
import { ChevronRight, Settings2 } from "lucide-react";
import type { IProject } from "@/services/project.service";

type ProjectCardProps = {
  project: IProject;
  projects: IProject[];
};

export const environmentOptions = [
  {
    index: 0,
    label: "Development",
    value: "dev",
    subtext: "For day-to-day development and testing unstable changes.",
  },
  {
    index: 1,
    label: "Testing",
    value: "test",
    subtext: "For QA testing and validation of new features.",
  },
  {
    index: 2,
    label: "Staging",
    value: "stg",
    subtext: "For final pre-prod validation in a near-production replica.",
  },
  {
    index: 3,
    label: "IAT",
    value: "iat",
    subtext: "For testing service integrations across modules/systems.",
  },
  {
    index: 4,
    label: "UAT",
    value: "uat",
    subtext: "For end-user or stakeholder validation of new features.",
  },
  {
    index: 5,
    label: "Prod Shadow",
    value: "prod-shadow",
    subtext: "For mirroring production data/traffic to validate changes invisibly.",
  },
  {
    index: 6,
    label: "Pre-Prod",
    value: "pre-prod",
    subtext: "For load testing, security checks, or final sanity tests before production.",
  },
  {
    index: 7,
    label: "Production",
    value: "prod",
    subtext: "The live environment serving actual users.",
  },
];

export const ProjectCard = ({ project, projects }: ProjectCardProps) => {
  const navigate = useNavigate();
  const { setTenantGroup, setSelectedProject } = useProjectStore();

  const onConfigureClick = () => {
    setTenantGroup(project.tenantGroupId);
    setSelectedProject(project);
    navigate("/project-overview/environments");
  };

  const onEnvBadgeClick = (e: React.MouseEvent, envProject: IProject) => {
    e.stopPropagation();
    setTenantGroup(envProject.tenantGroupId);
    setSelectedProject(envProject);
    navigate("/dashboard");
  };

  const renderEnvChip = (env: string, envProject: IProject) => {
    const label = environmentOptions.find((o) => o.value === env)?.label;
    return (
      <button
        key={env}
        onClick={(e) => onEnvBadgeClick(e, envProject)}
        className="group/chip border-primary bg-primary text-primary-foreground hover:text-primary inline-flex cursor-pointer items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-all duration-150 hover:border-[hsl(var(--blocks-primary-50))] hover:bg-[hsl(var(--blocks-primary-25))] active:scale-95"
      >
        {label}
        <ChevronRight className="h-3 w-3 transition-all duration-150 group-hover/chip:translate-x-0.5" />
      </button>
    );
  };

  const envList = projects.map((p) => p.environment);

  return (
    <Card className="border-border/60 bg-card hover:border-primary/30 group flex h-[160px] flex-col overflow-hidden rounded-xl border p-4 shadow-sm transition-all duration-200 hover:shadow-md">
      <div className="relative flex items-start justify-between gap-2">
        <CardTitle className="line-clamp-3 flex-1 break-all pr-2 text-base font-semibold leading-snug">
          {project.name}
        </CardTitle>
        <div className="absolute right-0 top-0">
          {/* <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 flex-shrink-0 text-primary transition-colors hover:bg-primary/10"
                  onClick={onConfigureClick}
                >
                  <Settings2 size={16} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Configure Project</TooltipContent>
            </Tooltip>
          </TooltipProvider> */}
        </div>
      </div>

      <div className="mt-auto">
        {envList.length === 0 ? (
          <span className="border-border/60 bg-muted/40 text-muted-foreground inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs">
            No environments
          </span>
        ) : envList.length > 3 ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex flex-wrap gap-1.5">
                  {projects.slice(0, 3).map((p) => renderEnvChip(p.environment, p))}
                  <span className="border-border/60 bg-muted/40 text-muted-foreground inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium">
                    +{projects.length - 3}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <div className="flex flex-wrap gap-1.5 p-1">
                  {projects.map((p) => renderEnvChip(p.environment, p))}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {projects.map((p) => renderEnvChip(p.environment, p))}
          </div>
        )}
      </div>
    </Card>
  );
};
