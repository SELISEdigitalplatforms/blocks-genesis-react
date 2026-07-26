import { ProjectDetail } from "@/components/common/project";
import { useBlocksAppConfigStore } from "@/hooks/use-blocks-app-config-store";
import { useGetProject } from "@/hooks/use-project";
import {
  CoreApiCard,
  useSwaggerEndpoints,
} from "./dashboard-overview-sections";

export const DashboardOverview = () => {
  const { name } = useBlocksAppConfigStore((state) => state.config);
  const { data, isFetching } = useGetProject();
  const {
    endpoints,
    isLoading: isLoadingEndpoints,
    error,
  } = useSwaggerEndpoints(name);

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
