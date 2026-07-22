import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { projectService } from "@/services/project.service";
import { useProjectStore } from "@/store/project.store";
import { useImpersonateStore } from "@/store/impersonate.store";
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

export const useGetProject = () => {
  const selectedProject = useProjectStore((state) => state.selectedProject);
  const {
    isInitialized,
    isImpersonated,
    impersonatedTenantId,
    originalTenantId,
  } = useImpersonateStore();

  // The endpoint answers "the project of whoever I am", so the tenant the token is
  // scoped to identifies the response — key the cache on that, not on an id the
  // server never reads.
  //
  // Compared case-insensitively: the store is written from the impersonation
  // status endpoint, and tenant ids reach us in inconsistent case (some projects
  // report `A8D3007A…`, others `Dd2394ff2…`). A case-only difference here would
  // silently disable the query and blank the dashboard, so do not tighten this
  // to `===` without first confirming both sides agree byte-for-byte.
  const tokenTenantId = isImpersonated
    ? impersonatedTenantId
    : originalTenantId;
  const sameTenant =
    Boolean(tokenTenantId) &&
    selectedProject?.tenantId?.toLowerCase() === tokenTenantId?.toLowerCase();

  return useQuery({
    queryKey: ["identifier", "project", tokenTenantId],
    queryFn: () => projectService.getProject(),
    // Only ask when the token's tenant IS the selected project. This preserves the
    // old `enabled: Boolean(projectId)` guard: on routes where impersonation has
    // been terminated no project is selected, so the query must stay idle rather
    // than fetch — and render — the root tenant's project.
    enabled: isInitialized && sameTenant,
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
