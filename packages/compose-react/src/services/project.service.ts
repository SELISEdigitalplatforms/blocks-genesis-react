import { logicClient } from "@/lib/http/instances";
import type {
  IProjectGroup,
  IGetProjectPayload,
  IGetProjectResponse,
} from "@/models";

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
