import { logicClient } from "@/lib/http";

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

const PROJECT_SUBPATH = "Project";
export const PROJECT_ENDPOINTS = {
  GETS: `/api/${PROJECT_SUBPATH}/Gets`,
  GET: `/api/${PROJECT_SUBPATH}/Get`,
  DISABLE: `/api/${PROJECT_SUBPATH}/Disable`,
};

export class ProjectService {
  getProjects(
    page = 0,
    pageSize = 100,
    tenantGroupId = "",
  ): Promise<IProjectGroup[]> {
    const url = `${PROJECT_ENDPOINTS.GETS}?page=${page}&pageSize=${pageSize}&tenantGroupId=${tenantGroupId}`;
    return logicClient.get(url);
  }

  getProject(payload: IGetProjectPayload): Promise<IGetProjectResponse> {
    const url = `${PROJECT_ENDPOINTS.GET}?projectId=${payload.projectId}`;
    return logicClient.get(url);
  }
}

export const projectService = new ProjectService();
