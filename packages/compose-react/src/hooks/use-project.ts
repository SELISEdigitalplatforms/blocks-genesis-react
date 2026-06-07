import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { projectService } from "@/services/project.service";
import { useProjectStore } from "@/store/project-store";
import { useBlocksAppConfigStore } from "@/layouts";

export const useGetProjects = (tenantGroupId = "") => {
  const { projectBaseUrlKey } = useBlocksAppConfigStore(
    (state) => state.config,
  );
  const { setProjects, selectedProject, setSelectedProject } =
    useProjectStore();
  const env =
    (window?.process?.env as Record<string, string | undefined> | undefined) ??
    {};
  const projectBaseUrl = projectBaseUrlKey
    ? (env[projectBaseUrlKey] ?? "")
    : "";
  const query = useQuery({
    queryKey: ["identifier", "projects", tenantGroupId],
    queryFn: () =>
      projectService.getProjects(projectBaseUrl, 0, 100, tenantGroupId),
    staleTime: 5 * 60 * 1000, // 5 minutes - prevent unnecessary refetches during navigation
  });

  useEffect(() => {
    if (!query.data) return;
    const flattenedProjects = query.data.flatMap((group) => group.projects);
    setProjects(flattenedProjects);
  }, [query.data, selectedProject, setProjects, setSelectedProject]);

  return query;
};

export const useGetProject = (options: { projectId: string }) => {
  return useQuery({
    queryKey: ["identifier", "project", options],
    queryFn: () => projectService.getProject(options),
    enabled: Boolean(options.projectId),
  });
};
