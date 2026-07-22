import { ProjectDetail } from "@/components/common/project";
import { useBlocksAppConfigStore } from "@/hooks/use-blocks-app-config-store";
import { useGetProject } from "@/hooks/use-project";
import { useProjectStore } from "@/store/project.store";
import {
  CoreApiCard,
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
      <ProjectDetail isLoading={isFetching} project={data?.data} />
      <CoreApiCard
        endpoints={endpoints}
        isLoading={isLoadingEndpoints}
        error={error}
      />
    </main>
  );
};
