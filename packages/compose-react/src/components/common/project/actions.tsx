import { ArchivedProject, RenderConditionally } from "@/components";
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
      <ArchivedProject />
    </RenderConditionally>
  );
};

const ProjectActionsSkeleton = () => {
  return <Skeleton className="h-10 w-32 rounded-md" />;
};
