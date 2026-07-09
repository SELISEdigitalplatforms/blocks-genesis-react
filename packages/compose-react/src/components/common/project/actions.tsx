import { ArchiveProject, RenderConditionally } from "@/components";
import { Skeleton } from "@/components/core";
import { useAuthStore } from "@/store";

type ProjectActionsProps = {
  isDisabled: boolean;
  createdBy: string;
  isFetching?: boolean;
};

export const ProjectActions = ({
  isDisabled,
  createdBy,
  isFetching = false,
}: ProjectActionsProps) => {
  const { user } = useAuthStore();
  const isOwner = createdBy === user?.sub;

  if (isFetching) {
    return <ProjectActionsSkeleton />;
  }

  return (
    <RenderConditionally condition={isOwner && !isDisabled}>
      <div className="flex items-center gap-2">
        {/* <EditProject /> */}
        <ArchiveProject />
      </div>
    </RenderConditionally>
  );
};

const ProjectActionsSkeleton = () => {
  return (
    <div className="flex items-center gap-2">
      {/* <Skeleton className="h-10 w-20 rounded-md" /> */}
      <Skeleton className="h-10 w-32 rounded-md" />
    </div>
  );
};
