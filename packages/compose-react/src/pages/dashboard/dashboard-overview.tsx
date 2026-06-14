import { ProjectDetail } from "@/components/common/project/detail";
import { useGetProject } from "@/hooks/use-project";
import { useProjectStore } from "@/store/project.store";

export const DashboardOverview = () => {
  const { itemId } = useProjectStore().selectedProject || {
    itemId: "",
    tenantId: "",
  };
  const { data, isLoading } = useGetProject({ projectId: itemId });

  return (
    <main className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-xl font-semibold md:text-2xl">
          Environment Overview
        </h1>
        {/* <ActionsListProject /> */}
      </div>
      <ProjectDetail project={data?.data} isLoading={isLoading} />
      {/* <ProjectRepoList project={data?.data} isLoading={isLoading} />
      <ProjectCliSnippet />
      <GitCommandSnippet /> */}
    </main>
  );
};
