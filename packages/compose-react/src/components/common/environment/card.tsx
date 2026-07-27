import { Card, CardHeader, CardTitle } from "@/components/core/card/card";
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
import { ChevronRightIcon, HourglassIcon } from "lucide-react";
import { useNavigate } from "react-router";

type EnvironmentCardProps = {
  project: IProject;
  isMigrationOngoing?: boolean;
  className?: string;
};

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
      // Clean start (this card lives where impersonation is terminated). The
      // dashboard's ImpersonationChecker/Synchronizer hydrate the impersonated
      // context after navigation — no full page reload. A reload here can abort
      // an in-flight refresh-token rotation, orphaning the rotating RT cookie
      // and 401'ing the later `stop` call.
      await mutateAsync({ targeted_tenant_id: project.tenantId });
      setTenantGroup(project.tenantGroupId);
      setSelectedProject(project);
      navigate(`/app/${project.itemId}/dashboard`);
    } catch (err) {
      console.error("Failed to switch environment", err);
    }
  };

  return (
    <Card
      onClick={handleCardClick}
      className={`group flex min-h-[70px] cursor-pointer flex-col justify-between rounded-sm p-4 shadow-none transition-shadow duration-200 hover:shadow-md ${className}`}
    >
      <CardHeader className="flex flex-row justify-between p-0">
        <CardTitle className="line-clamp-1 break-all text-lg leading-tight">
          <div className="flex w-fit flex-row items-center gap-1">
            <div className="text-medium-emphasis text-base">
              {
                environmentOptions.find(
                  (option) => option.value === project?.environment,
                )?.label
              }
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
          <span className="text-muted-foreground font-semibold">
            X-Blocks-Key:
          </span>
          <span className="text-muted-foreground truncate font-mono">
            {project?.tenantId}
          </span>
        </div>
      </div>
    </Card>
  );
};
