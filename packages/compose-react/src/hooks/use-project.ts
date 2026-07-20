import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { projectService } from "@/services/project.service";
import { useProjectStore } from "@/store/project.store";
import type {
  IUpdateProjectPayload,
  IUpdateTenantGroupPayload,
  IValidateCnameProjectPayload,
} from "@/models";

export const useGetProjects = (options: {
  tenantGroupId?: string;
  enabled?: boolean;
}) => {
  const setProjects = useProjectStore((state) => state.setProjects);
  const query = useQuery({
    queryKey: ["identifier", "projects", options?.tenantGroupId],
    queryFn: () => projectService.getProjects(0, 100, options?.tenantGroupId),
    enabled: !!options?.enabled,
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

export const useGetEnvRepositories = (projectKey: string) => {
  return useQuery({
    queryKey: ["env-repositories", projectKey],
    queryFn: () => projectService.getEnvRepositories(),
    enabled: !!projectKey,
  });
};

export const useUpdateRepositories = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["env-repositories", "update"],
    mutationFn: projectService.repoUpdate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["env-repositories"] });
    },
  });
};
export const useUpdateTenantGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["identifier", "tenant-group-update"],
    mutationFn: (payload: IUpdateTenantGroupPayload) =>
      projectService.updateTenantGroup(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["identifier", "tenant-group"],
      });
      queryClient.invalidateQueries({ queryKey: ["identifier", "projects"] });
    },
  });
};

export const useUpdateProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["identifier", "project-update"],
    mutationFn: (payload: IUpdateProjectPayload) =>
      projectService.updateProject(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["identifier", "project"] });
      queryClient.invalidateQueries({ queryKey: ["identifier", "projects"] });
    },
  });
};

export const useValidateCNameProject = (
  options: IValidateCnameProjectPayload,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["identifier", "projects", options],
    mutationFn: () => projectService.validateCNameProject(options),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["identifier", "project"],
      });
    },
  });
};

export const useDisableProject = (options: { projectKey: string }) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["identifier", "projects", "disable"],
    mutationFn: () => projectService.disableProject(options),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["identifier", "project", options],
      });
      queryClient.invalidateQueries({ queryKey: ["identifier", "projects"] });
    },
  });
};
