import type { ApplicationAction } from "@/components/common/dashboard-overview-sections/application";

export interface IProject {
  itemId: string;
  createdDate: string;
  lastUpdatedDate: string;
  createdBy: string;
  lastUpdatedBy: string;
  organizationIds: string[];
  tags: string[];
  name: string;
  applications: IApplication[];
  customDomain: string | null;
  cookieDomain: "blocksdevelopers.com";
  isProduction: true;
  tenantId: string;
  isCookieEnable: boolean;
  isDomainVerified: boolean;
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

export interface IEnvRepository {
  itemId: string;
  repoName: string;
  repoUrl: string;
  defaultDeploymentUrl: string;
  customDeploymentUrl: string;
  lastDeploymentDate: string;
}

export interface IUpdateTenantGroupPayload {
  name: string;
  tenantGroupId: string;
}
export interface IUpdateProjectPayload {
  action: ApplicationAction;
  application: IApplication;
  applicationDomain?: string;
}
export interface IUpdateProjectResponse {
  errors: unknown | null;
  isSuccess: boolean;
}
export interface IDisableProjectPayload {
  projectKey: string;
}
export interface IDisableProjectResponse {
  errors: string | null;
  isSuccess: boolean;
}

export interface IApplication {
  domain: string;
  cookieDomain: string;
  isDomainVerified: boolean;
}
