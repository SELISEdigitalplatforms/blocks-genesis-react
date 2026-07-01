import { ArchivedProject, RenderConditionally } from "@/components";
import { useAuthStore } from "@/store";

type ProjectActionsProps = {
  isDisabled: boolean;
  createdBy: string;
};

export const ProjectActions = ({
  isDisabled,
  createdBy,
}: ProjectActionsProps) => {
  const { user } = useAuthStore();
  const isOwner = createdBy === user?.sub;

  return (
    <RenderConditionally condition={isOwner && !isDisabled}>
      <ArchivedProject />
    </RenderConditionally>
  );
};
