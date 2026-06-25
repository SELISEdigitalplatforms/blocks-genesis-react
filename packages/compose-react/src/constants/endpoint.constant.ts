const API_BASE = "/api";
const AUTH_SUBPATH = "auth";
const NOTIFIER_SUBPATH = "Notifier";
const NOTIFICATION_SUBPATH = "Notification";
const PROJECT_SUBPATH = "Project";
const DOMAIN_SUBPATH = "Domain";
const BUILD_SUBPATH = "Build";
const DEPLOYMENT_SUBPATH = "Deployment";
const IAM_SUBPATH = "iam";

export const AUTH_ENDPOINTS = {
  OIDC_TOKEN: `${API_BASE}/oidc/token`,
  LOGOUT: `${API_BASE}/${AUTH_SUBPATH}/Logout`,
  ME: `${API_BASE}/${IAM_SUBPATH}/me`,
} as const;

export const IAM_ENDPOINTS = {
  INITIATE: `${API_BASE}/idp/initiate`,
} as const;

export const IMPERSONATE_ENDPOINTS = {
  IMPERSONATE: `${API_BASE}/${AUTH_SUBPATH}/impersonate`,
  STOP_IMPERSONATION: `${API_BASE}/${AUTH_SUBPATH}/impersonation/stop`,
  IMPERSONATION_STATUS: `${API_BASE}/${AUTH_SUBPATH}/impersonation/status`,
} as const;

export const NOTIFICATION_ENDPOINTS = {
  GET_NOTIFICATIONS: `${API_BASE}/${NOTIFIER_SUBPATH}/GetNotifications`,
  MARK_AS_READ: `${API_BASE}/${NOTIFIER_SUBPATH}/MarkNotificationAsRead`,
  MARK_ALL_AS_READ: `${API_BASE}/${NOTIFIER_SUBPATH}/MarkAllNotificationAsRead`,
} as const;

export const NOTIFICATION_CONFIG_ENDPOINTS = {
  GET_CONFIGS: `${API_BASE}/${NOTIFICATION_SUBPATH}/Gets`,
} as const;

export const PROJECT_ENDPOINTS = {
  GETS: `${API_BASE}/${PROJECT_SUBPATH}/Gets`,
  GET: `${API_BASE}/${PROJECT_SUBPATH}/Get`,
  DISABLE: `${API_BASE}/${PROJECT_SUBPATH}/Disable`,
  UPDATE_TENANT_GROUP: `${API_BASE}/${PROJECT_SUBPATH}/UpdateTenantGroup`,
  CONFIGURE: `${API_BASE}/${DOMAIN_SUBPATH}/Configure`,
  REPOS_LIST: `${API_BASE}/${DEPLOYMENT_SUBPATH}/GetReposList`,
  REPO_UPDATE: `${API_BASE}/${BUILD_SUBPATH}/repo-update`,
} as const;

export const ORGANIZATION_ENDPOINTS = {
  GET_ORGANIZATIONS: `${API_BASE}/${IAM_SUBPATH}/organizations`,
  GET_ORGANIZATION: `${API_BASE}/${IAM_SUBPATH}/organization`,
  CREATE_ORGANIZATION: `${API_BASE}/${IAM_SUBPATH}/organizations/create`,
  SAVE_ORGANIZATION: `${API_BASE}/${IAM_SUBPATH}/organizations`,
  UPDATE_ORGANIZATION: `${API_BASE}/${IAM_SUBPATH}/organizations`,
  GET_ORGANIZATION_CONFIG: `${API_BASE}/${IAM_SUBPATH}/organizations/config`,
  SAVE_ORGANIZATION_CONFIG: `${API_BASE}/${IAM_SUBPATH}/organizations/config`,
  GET_MY_ORGANIZATIONS: `${API_BASE}/${IAM_SUBPATH}/organizations/my`,
  GET_SIGNUP_SETTING: `${API_BASE}/${IAM_SUBPATH}/signup-settings`,
  SAVE_SIGNUP_SETTING: `${API_BASE}/${IAM_SUBPATH}/signup-settings`,
} as const;
