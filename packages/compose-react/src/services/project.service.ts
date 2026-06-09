import { useBlocksAppConfigStore } from "@/layouts";
import { HttpClient } from "@seliseblocks/blocks-kit-core";

export interface IProject {
  itemId: string;
  createdDate: string;
  lastUpdatedDate: string;
  createdBy: string;
  lastUpdatedBy: string;
  organizationIds: string[];
  tags: string[];
  name: string;
  applicationDomain: string;
  customDomain: string;
  isProduction: true;
  tenantId: string;
  isCookieEnable: boolean;
  isDomainVerified: boolean;
  cookieDomain: string;
  isDisabled: boolean;
  environment: string;
  tenantGroupId: string;
  tenantSlug: string;
}

export interface IGetProjectPayload {
  projectId: string;
}
export interface IGetProjectResponse {
  data: IProject;
  errors: unknown | null;
}

export interface IProjectGroup {
  tenantGroupId: string;
  projects: IProject[];
  nonSharedProject: IProject[];
  isShared: boolean;
}

const http = new HttpClient({
  baseURL: window?.process?.env?.BLOCKS_API_BASE_URL || "",
  blocksKey: window?.process?.env?.BLOCKS_X_BLOCKS_KEY,
});

const PROJECT_SUBPATH = "Project";
export const PROJECT_ENDPOINTS = {
  GETS: `api/${PROJECT_SUBPATH}/Gets`,
  GET: `api/${PROJECT_SUBPATH}/Get`,
  DISABLE: `api/${PROJECT_SUBPATH}/Disable`,
};

export class ProjectService {
  getProjects(
    projectBaseUrl = "",
    page = 0,
    pageSize = 100,
    tenantGroupId = "",
  ): Promise<IProjectGroup[]> {
    const url = `${projectBaseUrl}/${PROJECT_ENDPOINTS.GETS}?page=${page}&pageSize=${pageSize}&tenantGroupId=${tenantGroupId}`;
    return http.get(url, undefined, { absoluteUrl: true });
  }

  getProject(payload: IGetProjectPayload): Promise<IGetProjectResponse> {
    const url = `${PROJECT_ENDPOINTS.GET}?projectId=${payload.projectId}`;
    return http.get(url, undefined, { absoluteUrl: true });
  }
}

export const projectService = new ProjectService();
