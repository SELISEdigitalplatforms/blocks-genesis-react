import { ArchivedProject, EditProject } from "@/components";
import { useGetProject } from "@/hooks/use-project";
import { useAuthStore, useProjectStore } from "@/store";
export const ActionsListProject = () => {
  const { user } = useAuthStore();
  const selectedProject = useProjectStore((state) => state.selectedProject);
  const { data, isLoading, isFetching } = useGetProject({
    projectId: selectedProject?.itemId || "",
  });
  const isOwner = data?.data?.createdBy === user?.itemId;
  return (
    <div className="flex items-center gap-2">
      {!isLoading && !isFetching && !data?.data?.isDisabled && isOwner && (
        <ArchivedProject />
      )}
      {!data?.data?.isDisabled && (
        <>
          {!isLoading && !isFetching && (
            <EditProject data={data} isLoading={isLoading} />
          )}
        </>
      )}
    </div>
  );
};
