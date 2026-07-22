import { iamClient } from "@/lib/http";
import type { IGetMyOrganizationsResponse } from "@/models";
import { ORGANIZATION_ENDPOINTS } from "@/constants/endpoint.constant";

export class OrganizationService {
  getMyOrganizations(): Promise<IGetMyOrganizationsResponse> {
    return iamClient.get(ORGANIZATION_ENDPOINTS.GET_MY_ORGANIZATIONS);
  }
}

export const organizationService = new OrganizationService();
