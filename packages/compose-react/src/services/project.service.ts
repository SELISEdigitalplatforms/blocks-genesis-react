import { logicClient } from "@/lib/http/instances";
import type {
  IProjectGroup,
  IGetProjectPayload,
  IGetProjectResponse,
  IDisableProjectPayload,
  IDisableProjectResponse,
  IUpdateTenantGroupPayload,
  IUpdateProjectResponse,
  IEnvRepository,
} from "@/models";
import { PROJECT_ENDPOINTS } from "@/constants/endpoint.constant";
import { getRuntimeEnv, HttpClient } from "@/lib";

//Exception only for OS.
const logicClientForOS = new HttpClient({
  baseURL: () => getRuntimeEnv("BLOCKS_LOGIC_BASE_URL"),
  blocksKey: () => getRuntimeEnv("BLOCKS_X_BLOCKS_KEY"),
});

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

  getEnvRepositories(projectKey: string): Promise<{
    data: IEnvRepository[];
    errors: unknown | null;
    isSuccess: boolean;
  }> {
    const url = `${PROJECT_ENDPOINTS.REPOS_LIST}?projectkey=${projectKey}`;
    return logicClientForOS.get(url);
  }

  repoUpdate(payload: {
    projectKey: string;
    projectEnv: string;
    repoWithDomains: {
      repoId: string;
      repoUrl: string;
      customDeploymentDomain: string;
    }[];
  }): Promise<{
    errors: unknown | null;
    isSuccess: boolean;
  }> {
    return logicClient.post(PROJECT_ENDPOINTS.REPO_UPDATE, payload);
  }

  updateTenantGroup(
    payload: IUpdateTenantGroupPayload,
  ): Promise<IUpdateProjectResponse> {
    return logicClient.post(PROJECT_ENDPOINTS.UPDATE_TENANT_GROUP, payload);
  }

  disableProject(
    payload: IDisableProjectPayload,
  ): Promise<IDisableProjectResponse> {
    return logicClient.post(PROJECT_ENDPOINTS.DISABLE, payload);
  }

  validateCNameProject(payload: {
    projectKey: string;
  }): Promise<{ isValid: boolean }> {
    return logicClient.post(PROJECT_ENDPOINTS.CONFIGURE, payload);
  }
}

export const projectService = new ProjectService();
