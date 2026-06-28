import {
  ActionsListProject,
  AppIntegrationCard,
  CoreApiCard,
  GitCommandSnippet,
  ProjectCliSnippet,
  ProjectDetail,
  ProjectRepoList,
  RenderConditionally,
  useSwaggerEndpoints,
} from "@/components";
import { useBlocksAppConfigStore } from "@/hooks/use-blocks-app-config-store";
import { useGetProject } from "@/hooks/use-project";
import { useProjectStore } from "@/store/project.store";
import { Puzzle } from "lucide-react";

export const DashboardOverview = () => {
  const { name } = useBlocksAppConfigStore((state) => state.config);
  const { itemId } = useProjectStore().selectedProject || {
    itemId: "",
    tenantId: "",
  };
  const { data, isLoading } = useGetProject({ projectId: itemId });

  const {
    endpoints,
    isLoading: isLoadingEndpoints,
    error,
  } = useSwaggerEndpoints(name);

  return (
    <main className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-xl font-semibold md:text-2xl">Overview</h1>
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
      <RenderConditionally condition={name !== "blocks-os"}>
        <CoreApiCard
          endpoints={endpoints}
          isLoading={isLoadingEndpoints}
          error={error}
        />
        <AppIntegrationCard
          title="Connect Extensions"
          description="Install the UILM browser extension or open it directly"
          links={[
            {
              id: "chrome-ext",
              label: "Install Chrome Extension",
              href: "https://chromewebstore.google.com/detail/selise-blocks-assistant/ehnhmdghlkaeaiinoahgipdeogkikjem",
              icon: <Puzzle className="h-4 w-4" />,
            },
          ]}
          clientId={"dummy-client-id"}
          clientSecret={"dummy-client-secret"}
        />
      </RenderConditionally>
    </main>
  );
};
