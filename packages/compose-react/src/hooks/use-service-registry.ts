import type { IGetAllServicesPayload } from "@/models";
import { serviceRegistryService } from "@/services/service-registry.service";
import { useQuery } from "@tanstack/react-query";

export const useGetAllServices = (options: IGetAllServicesPayload) => {
  return useQuery({
    queryKey: ["services", options.projectKey, options.page, options.pageSize],
    queryFn: () => serviceRegistryService.getAllServices(options),
    enabled: !!options.projectKey,
  });
};
