import { ProjectRepoList, RenderConditionally } from "@/components";
import {
  ProjectActions,
  ProjectDetail,
  ProjectOverview,
} from "@/components/common/project";
import { useBlocksAppConfigStore } from "@/hooks/use-blocks-app-config-store";
import { useGetProject } from "@/hooks/use-project";
import { useProjectStore } from "@/store/project.store";
import {
  CoreApiCard,
  DomainsSection,
  useSwaggerEndpoints,
} from "./dashboard-overview-sections";

export const DashboardOverview = () => {
  const { name } = useBlocksAppConfigStore((state) => state.config);
  const { itemId } = useProjectStore().selectedProject || {
    itemId: "",
    tenantId: "",
  };
  const { data, isFetching } = useGetProject({ projectId: itemId });
  const {
    endpoints,
    isLoading: isLoadingEndpoints,
    error,
  } = useSwaggerEndpoints(name);

  if (!data?.data) return null;

  return (
    <main className="flex flex-col gap-6 p-6">
      <RenderConditionally condition={name === "blocks-os"}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <ProjectOverview
            name={data?.data?.name || ""}
            environment={data?.data?.environment || ""}
            tenantId={data?.data?.tenantId || ""}
            isFetching={isFetching}
          />
          <RenderConditionally condition={name === "blocks-os"}>
            <ProjectActions
              isDisabled={!!data?.data?.isDisabled}
              createdBy={data?.data?.createdBy || ""}
              isFetching={isFetching}
            />
          </RenderConditionally>
        </div>

        <DomainsSection applications={data?.data.applications || []} />
      </RenderConditionally>

      <RenderConditionally condition={name !== "blocks-os"}>
        <ProjectDetail isLoading={isFetching} project={data?.data} />
      </RenderConditionally>

      <RenderConditionally condition={name === "blocks-os"}>
        <ProjectRepoList project={data?.data} isLoading={isFetching} />
      </RenderConditionally>
      <RenderConditionally condition={name !== "blocks-os"}>
        <CoreApiCard
          endpoints={endpoints}
          isLoading={isLoadingEndpoints}
          error={error}
        />
      </RenderConditionally>
    </main>
  );
};
