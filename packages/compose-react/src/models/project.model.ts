import type { DomainAction } from "@/pages/dashboard/dashboard-overview-sections/domain";

export interface IProject {
  itemId: string;
  createdDate: string;
  lastUpdatedDate: string;
  createdBy: string;
  lastUpdatedBy: string;
  organizationIds: string[];
  tags: string[];
  name: string;
  applications: IDomain[];
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

export interface IGetProjectResponse {
  data: IProject;
  errors: unknown | null;
}

export interface IProjectGroup {
  tenantGroupId: string;
  projects: IProject[];
  nonSharedProject: IProject[];
  isShared: boolean;
  /**
   * The caller's `menu::action` grants in this group, unioned across their environments.
   * Empty for a shared group whose owner has granted nothing; empty as well for a group the
   * caller owns, where ownership already implies everything.
   *
   * Optional because an API older than the field omits it entirely — read a missing value as
   * "unknown", never as "nothing granted".
   */
  accessPolicies?: string[];
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
  action: DomainAction;
  application: IDomain;
  applicationDomain?: string;
}
export interface IUpdateProjectResponse {
  errors: unknown | null;
  isSuccess: boolean;
}
export interface IValidateCnameProjectPayload {
  cookieDomain: string;
}
export interface IValidateCnameProjectResponse {
  errors: Record<string, string> | null;
  isSuccess: boolean;
}
export interface IDisableProjectPayload {
  projectKey: string;
}
export interface IDisableProjectResponse {
  errors: string | null;
  isSuccess: boolean;
}

export interface IDomain {
  domain: string;
  cookieDomain: string;
  isDomainVerified: boolean;
}
