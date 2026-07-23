import { Button, DashboardSectionCard } from "@/components";
import { environmentOptions } from "@/constants/environment-options";
import {
  CopyToClipboardButton,
  formatFullDate,
  MaskedText,
  Skeleton,
} from "@/index";
import type { IProject } from "@/models";
import type { ReactNode } from "react";

interface ProjectDetailItemProps {
  label: string;
  children: ReactNode;
}

const ProjectDetailItem = ({ label, children }: ProjectDetailItemProps) => (
  <div className="space-y-1.5">
    <div className="text-sm font-medium text-medium-emphasis">{label}</div>
    <div className="text-sm text-high-emphasis sm:text-base">{children}</div>
  </div>
);


const LoadingSkeleton = () => {
  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="px-3 py-2.5 sm:px-4 sm:py-3">
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="grid grid-cols-1 gap-4 border-t border-border px-2 py-2 sm:px-4 sm:py-3 md:grid-cols-2 md:gap-6">
        {["sk-1", "sk-2", "sk-3", "sk-4", "sk-5", "sk-6"].map((itemKey) => (
          <div key={itemKey}>
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="mt-2 h-5 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
};

export const ProjectDetail = ({
  project,
  isLoading,
}: {
  project?: IProject;
  isLoading: boolean;
}) => {
  if (isLoading) return <LoadingSkeleton />;

  return (
    <DashboardSectionCard
      title="Project Details"
      description="Core configuration and metadata for this project"
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
        <ProjectDetailItem label="Name">{project?.name}</ProjectDetailItem>
        <ProjectDetailItem label="X-Blocks-Key">
          <div className="flex h-6 items-center gap-2">
            <CopyToClipboardButton
              textToCopy={project?.tenantId || ""}
              isHoverable
            >
              <MaskedText
                text={project?.tenantId || ""}
                showFirstN={3}
                showLastN={3}
                length={20}
              />
            </CopyToClipboardButton>
          </div>
        </ProjectDetailItem>
        <ProjectDetailItem label="Environment">
          {project?.environment === "prod" ? (
            <Button className="h-6 rounded-xl" size="sm" variant="default">
              Production
            </Button>
          ) : (
            <Button
              className="h-6 rounded-xl bg-blocks-btn-secondary hover:bg-blocks-btn-secondary/80"
              size="sm"
              variant="secondary"
            >
              {
                environmentOptions.find(
                  (option) => option.value === project?.environment,
                )?.label
              }
            </Button>
          )}
        </ProjectDetailItem>
        {/* <ProjectDetailItem label="Blocks Microservices Url">
          <RenderProjectUrl project={project} />
        </ProjectDetailItem> */}
        <ProjectDetailItem label="Last updated Date">
          {project?.lastUpdatedDate &&
            formatFullDate(new Date(project.lastUpdatedDate))}
        </ProjectDetailItem>
        <ProjectDetailItem label="Created Date">
          {project?.createdDate &&
            formatFullDate(new Date(project.createdDate))}
        </ProjectDetailItem>
      </div>
    </DashboardSectionCard>
  );
};
