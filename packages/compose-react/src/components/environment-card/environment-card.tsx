import { ChevronRight, Hourglass } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle } from "@/components/core/card/card";
import { useProjectStore } from "@/store/project-store";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/core/tooltip/tooltip";
import type { IProject } from "@/services/project.service";
import { useStartImpersonation } from "@/hooks/use-auth-api";

type EnvironmentCardProps = {
  project: IProject;
  isMigrationOngoing?: boolean;
  className?: string;
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

export const EnvironmentCard = ({
  project,
  isMigrationOngoing,
  className,
}: EnvironmentCardProps) => {
  const { setSelectedProject, setTenantGroup } = useProjectStore();
  const { mutateAsync } = useStartImpersonation();
  const navigate = useNavigate();

  const handleCardClick = async (): Promise<void> => {
    try {
      await mutateAsync({ targeted_tenant_id: project.tenantId });
      setTenantGroup(project.tenantGroupId);
      setSelectedProject(project);
      navigate("/dashboard");
      window.location.reload();
    } catch (err) {
      console.log("Failed to switch environment", err);
    }
  };
  const HourglassIcon = Hourglass as any;
  const ChevronRightIcon = ChevronRight as any;

  return (
    <Card
      onClick={handleCardClick}
      className={`group flex min-h-[70px] cursor-pointer flex-col justify-between rounded-sm p-4 shadow-none transition-shadow duration-200 hover:shadow-md ${className}`}
    >
      <CardHeader className="flex flex-row justify-between !p-0">
        <CardTitle className="line-clamp-1 break-all text-lg leading-tight">
          <div className="flex w-fit flex-row items-center gap-1">
            <div className="text-medium-emphasis text-base">
              {environmentOptions.find((option) => option.value === project?.environment)?.label}
            </div>
            {isMigrationOngoing && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HourglassIcon className="text-icon-warning h-4 w-4 cursor-pointer" />
                  </TooltipTrigger>
                  <TooltipContent className="border-none bg-neutral-500 text-white shadow-none">
                    Migration in progress
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </CardTitle>
        <ChevronRightIcon className="h-4 w-4 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
      </CardHeader>
      <div className="mt-2">
        <div className="flex flex-wrap items-center gap-1.5 py-0.5 text-xs sm:py-1 md:py-1.5">
          <span className="text-muted-foreground font-semibold">X-Blocks-Key:</span>
          <span className="text-muted-foreground truncate font-mono">{project?.tenantId}</span>
        </div>
      </div>
    </Card>
  );
};
