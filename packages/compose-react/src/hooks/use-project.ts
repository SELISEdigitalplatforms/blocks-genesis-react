import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { projectService } from "@/services/project.service";
import { useProjectStore } from "@/store/project.store";

export const useGetProjects = (options: { tenantGroupId?: string }) => {
  const setProjects = useProjectStore((state) => state.setProjects);
  const projectBaseUrl = window?.process?.env?.projectBaseUrl || "";
  const query = useQuery({
    queryKey: ["identifier", "projects", options?.tenantGroupId],
    queryFn: () =>
      projectService.getProjects(
        projectBaseUrl,
        0,
        100,
        options?.tenantGroupId,
      ),
  });

  useEffect(() => {
    if (!query.data) return;
    const flattenedProjects = query.data.flatMap((group) => group.projects);
    setProjects(flattenedProjects);
  }, [query.data, setProjects]);

  return query;
};

export const useGetProject = (options: { projectId: string }) => {
  return useQuery({
    queryKey: ["identifier", "project", options],
    queryFn: () => projectService.getProject(options),
    enabled: Boolean(options.projectId),
  });
};
