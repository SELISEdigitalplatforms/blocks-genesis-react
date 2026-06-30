import { SERVICE_REGISTRY_ENDPOINTS } from "@/constants/endpoint.constant";
import { logicClient } from "@/lib/http";
import type { IGetAllServicesPayload, IGetAllServicesResponse } from "@/models";

export class ServiceRegistryService {
  getAllServices(
    payload: IGetAllServicesPayload,
  ): Promise<IGetAllServicesResponse> {
    return logicClient.post(`${SERVICE_REGISTRY_ENDPOINTS.GET_ALL}`, payload);
  }
}

export const serviceRegistryService = new ServiceRegistryService();
