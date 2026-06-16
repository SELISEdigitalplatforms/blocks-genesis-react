import {
  ActionsListProject,
  GitCommandSnippet,
  ProjectCliSnippet,
  ProjectDetail,
  ProjectRepoList,
  RenderConditionally,
} from "@/components";
import { useBlocksAppConfigStore } from "@/hooks/use-blocks-app-config-store";
import { useGetProject } from "@/hooks/use-project";
import { useProjectStore } from "@/store/project.store";

export const DashboardOverview = () => {
  const { name } = useBlocksAppConfigStore((state) => state.config);
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
        <RenderConditionally condition={name === "blocks-os"}>
          <ActionsListProject />
        </RenderConditionally>
      </div>
      <ProjectDetail project={data?.data} isLoading={isLoading} />
      <RenderConditionally condition={name === "blocks-os"}>
        <ProjectRepoList project={data?.data} isLoading={isLoading} />
        <ProjectCliSnippet />
        <GitCommandSnippet />
      </RenderConditionally>
    </main>
  );
};
