import type { ServiceName } from "@/store";

/**
 * Where a notification opens. `scoped` paths sit under the current project (`/app/<itemId>/<path>`);
 * the others are full paths. The link is built here from the event and its ids, never taken from the
 * payload, so a payload cannot send the user to any page.
 */
export interface NotificationLink {
  app: ServiceName;
  path: string;
  scoped: boolean;
}

type Payload = Record<string, unknown>;
type LinkBuilder = (payload: Payload) => NotificationLink | null;

/** The id as a URL segment, or null when it is missing or blank. */
const idOf = (payload: Payload, key: string): string | null => {
  const value = payload[key];
  return typeof value === "string" && value.trim() !== ""
    ? encodeURIComponent(value)
    : null;
};

const scopedIn =
  (app: ServiceName) =>
  (path: string): NotificationLink => ({ app, path, scoped: true });

const logic = scopedIn("blocks-logic");
const release = scopedIn("blocks-release");
const osScoped = scopedIn("blocks-os");
const osProject = (groupId: string, page: string): NotificationLink => ({
  app: "blocks-os",
  path: `/app/project/${groupId}/${page}`,
  scoped: false,
});

const workflowRunFailed: LinkBuilder = (p) => {
  const workflowId = idOf(p, "workflowId");
  if (!workflowId) return null;
  const executionId = idOf(p, "executionId");
  const query = executionId
    ? `?tab=executions&executionId=${executionId}`
    : "?tab=executions";
  return logic(`workflow/${workflowId}${query}`);
};

const workflowPage: LinkBuilder = (p) => {
  const workflowId = idOf(p, "workflowId");
  return workflowId ? logic(`workflow/${workflowId}`) : null;
};

const functionRunFailed: LinkBuilder = (p) => {
  const functionId = idOf(p, "functionId");
  if (!functionId) return null;
  const runId = idOf(p, "runId");
  const query = runId ? `?tab=runs&runId=${runId}` : "?tab=runs";
  return logic(`functions/${functionId}${query}`);
};

const functionPage: LinkBuilder = (p) => {
  const functionId = idOf(p, "functionId");
  return functionId ? logic(`functions/${functionId}`) : null;
};

const functionChangedByOther: LinkBuilder = (p) =>
  p.action === "deleted" ? logic("functions") : functionPage(p);

const scheduleRegistrationFailed: LinkBuilder = (p) => {
  const scheduleId = idOf(p, "scheduleId");
  return scheduleId ? logic(`schedule/${scheduleId}`) : null;
};

const buildLogs = (p: Payload, tab: string): NotificationLink | null => {
  const repoId = idOf(p, "repoId");
  const buildId = idOf(p, "buildId");
  if (!repoId || !buildId) return null;
  return release(
    `deployment/repo/${repoId}/deployment-logs/${buildId}?tab=${tab}`,
  );
};

const repoPage: LinkBuilder = (p) => {
  const repoId = idOf(p, "repoId");
  return repoId ? release(`deployment/repo/${repoId}`) : null;
};

const autoDeployStatus: LinkBuilder = (p) => {
  const repoId = idOf(p, "repoId");
  const buildId = idOf(p, "buildId");
  if (repoId && buildId) {
    return release(`deployment/repo/${repoId}/deployment-live/${buildId}`);
  }
  return repoPage(p);
};

const codeAnalysisFinished: LinkBuilder = (p) =>
  buildLogs(p, p.analysisType === "SCA" ? "sca" : "sast");

const projectPage =
  (key: string, page: string): LinkBuilder =>
  (p) => {
    const groupId = idOf(p, key);
    return groupId ? osProject(groupId, page) : null;
  };

const organizationDetail: LinkBuilder = (p) => {
  const organizationId = idOf(p, "organizationId");
  return organizationId
    ? osScoped(`iam/organization-detail/${organizationId}`)
    : null;
};

const invitedUserDetail: LinkBuilder = (p) => {
  const userId = idOf(p, "invitedUserId");
  return userId ? osScoped(`iam/user-detail/${userId}`) : null;
};

/** One entry per notification `event` that has a page to open. Other events open nothing. */
const LINK_BUILDERS: Record<string, LinkBuilder> = {
  WorkflowRunFailed: workflowRunFailed,
  ScheduledTriggerDropped: workflowPage,
  FunctionRunFailed: functionRunFailed,
  FunctionBuildFinished: functionPage,
  FunctionChangedByOther: functionChangedByOther,
  ScheduleRegistrationFailed: scheduleRegistrationFailed,
  "release-build-finished": (p) => buildLogs(p, "deployment-logs"),
  "release-auto-deploy-status": autoDeployStatus,
  "release-deployment-deleted": repoPage,
  "release-code-analysis-finished": codeAnalysisFinished,
  "project-setup-failed": projectPage("tenantGroupId", "environments"),
  "project-ownership-transferred": projectPage("tenantGroupId", "people"),
  "project-access-changed": projectPage("projectGroupId", "environments"),
  "iam-organization-setup-finished": organizationDetail,
  "iam-invitation-mail-failed": invitedUserDetail,
};

const parsePayload = (raw: string): Payload | null => {
  try {
    const parsed: unknown = JSON.parse(raw);
    return parsed !== null && typeof parsed === "object"
      ? (parsed as Payload)
      : null;
  } catch {
    return null;
  }
};

/** The page a stored notification opens, or null when its event has none or an id is missing. */
export function getNotificationLink(
  denormalizedPayload: string,
): NotificationLink | null {
  const payload = parsePayload(denormalizedPayload);
  const event = payload?.event;
  if (!payload || typeof event !== "string") return null;
  const build = Object.hasOwn(LINK_BUILDERS, event)
    ? LINK_BUILDERS[event]
    : undefined;
  return build ? build(payload) : null;
}

/**
 * The in-app path for a notification, or null when it cannot open here: its page lives in another
 * app, or it needs a project and none is open (for example on the console page).
 */
export function getNotificationHref(
  denormalizedPayload: string,
  currentApp: ServiceName,
  projectItemId: string | undefined,
): string | null {
  const link = getNotificationLink(denormalizedPayload);
  if (link?.app !== currentApp) return null;
  if (!link.scoped) return link.path;
  return projectItemId
    ? `/app/${encodeURIComponent(projectItemId)}/${link.path}`
    : null;
}
