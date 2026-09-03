import { environmentOptions } from "@/constants/environment-options";
import type { IProjectGroup } from "@/models";

export const canOpenProject = (group: IProjectGroup) =>
  !group.isShared || !group.accessPolicies || group.accessPolicies.length > 0;

export const getProjectGroupName = (group: IProjectGroup) =>
  group.projects[0]?.name ?? "";

export const getLatestProjectUpdate = (group: IProjectGroup) =>
  group.projects.reduce((latest, project) => {
    const timestamp = Date.parse(project.lastUpdatedDate);
    return Number.isFinite(timestamp) ? Math.max(latest, timestamp) : latest;
  }, 0);

export const getEnvironmentLabel = (environment: string) =>
  environmentOptions.find((option) => option.value === environment)?.label ??
  environment;
