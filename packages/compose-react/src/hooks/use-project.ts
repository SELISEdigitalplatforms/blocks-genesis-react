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
  const { isImpersonated, impersonatedTenantId, originalTenantId } =
    useImpersonateStore();

  // The endpoint answers "the project of whoever I am", so the tenant the token is
  // scoped to identifies the response — key the cache on that, not on an id the
  // server never reads. All consumers mount inside ImpersonationChecker, which
  // renders nothing until the store is populated, so this is resolved by the time
  // the query runs.
  const tokenTenantId = isImpersonated
    ? impersonatedTenantId
    : originalTenantId;

  return useQuery({
    queryKey: ["identifier", "project", tokenTenantId],
    queryFn: () => projectService.getProject(),
    // Deliberately unchanged from the previous `Boolean(options.projectId)`, which
    // was fed `selectedProject?.itemId`. It is load-bearing: on project-overview
    // routes ImpersonationTerminator drops the token to root and no project is
    // selected, and this keeps the query idle there. Tightening it to also require
    // the token's tenant to match the selected project is the stricter, more
    // correct rule — but it depends on `selectedProject.tenantId` and the
    // impersonation status endpoint agreeing byte-for-byte, which is unverified.
    // Getting that wrong disables the query permanently and blanks
    // dashboard-overview (`if (!data?.data) return null`).
    enabled: isImpersonated && Boolean(selectedProject?.itemId),
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
