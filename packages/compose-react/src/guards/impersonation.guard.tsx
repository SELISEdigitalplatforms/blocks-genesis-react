import { AppLoadingSpinner } from "@/components/common/loader-spinner";
import {
  useImpersonationStatusChecker,
  useStartImpersonation,
  useStopImpersonation,
} from "@/hooks/use-impersonation";
import { useGetProjects } from "@/hooks/use-project";
import { HttpError } from "@/lib/http/error";
import { useImpersonateStore, useProjectStore } from "@/store";
import { useCallback, useEffect, useRef, useState } from "react";
import { projectService } from "@/services/project.service";
import type { ImpersonationRequest } from "@/models";

export const ImpersonationChecker = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { data, isLoading, isSuccess } = useImpersonationStatusChecker();
  const { setImpersonation, isInitialized, setInitialized } =
    useImpersonateStore();

  useEffect(() => {
    if (!data) return;
    setImpersonation(
      data.impersonated,
      data.originalTenantId,
      data.impersonated ? data.impersonatedTenantId : null,
    );
    setInitialized(true);
  }, [data, setImpersonation, setInitialized]);

  if (isLoading || !isSuccess || !isInitialized) return null;
  return <>{children}</>;
};

export function ImpersonationTerminator({
  children,
}: {
  children: React.ReactNode;
}) {
  const { terminate, isImpersonated } = useImpersonateStore();
  const { mutateAsync } = useStopImpersonation();
  const isTriggering = useRef(false);
  const [isTerminating, setIsTerminating] = useState(false);

  useEffect(() => {
    if (isTriggering.current || !isImpersonated) return;

    isTriggering.current = true;
    setIsTerminating(true);
    const blocksKey = window.process?.env.BLOCKS_X_BLOCKS_KEY || "";

    const stopImpersonation = async () => {
      try {
        await mutateAsync(undefined);
      } catch (error) {
        // Stop can 401 when impersonation is already cleared server-side.
        // Always clear local state so we do not re-trigger stop on next layout.
        if (!(error instanceof HttpError) || error.status !== 401) {
          console.error("Error stopping impersonation:", error);
        }
      } finally {
        terminate(blocksKey);
        isTriggering.current = false;
        setIsTerminating(false);
      }
    };

    void stopImpersonation();
  }, [mutateAsync, terminate, isImpersonated]);

  if (isImpersonated || isTerminating) return <AppLoadingSpinner />;
  return <>{children}</>;
}

export function ImpersonationSynchronizer({
  children,
}: {
  children: React.ReactNode;
}) {
  const { impersonate, isImpersonated, impersonatedTenantId } =
    useImpersonateStore();
  const { mutateAsync } = useStartImpersonation();
  const { data: _data } = useGetProjects({});

  const { selectedProject, setSelectedProject, projects, setTenantGroup } =
    useProjectStore();
  const isTriggering = useRef(false);
  const [isImpersonating, setIsImpersonating] = useState(false);

  const getProject = async (tenantId: string) => {
    try {
      const res = projectService.getProject({ projectId: tenantId });
      return (await res).data;
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const runImpersonation = useCallback(async () => {
    isTriggering.current = true;
    setIsImpersonating(true);
    try {
      if (impersonatedTenantId) {
        let project = projects.find(
          (project) => project.tenantId === impersonatedTenantId,
        );
        if (!project) project = await getProject(impersonatedTenantId);
        if (!project) {
          isTriggering.current = false;
          setIsImpersonating(false);
          return;
        }
        setSelectedProject(project);
        setTenantGroup(project.tenantGroupId);
        isTriggering.current = false;
        setIsImpersonating(false);
        return;
      }

      // need to impersonate for the selected project
      const payload: ImpersonationRequest = {
        targeted_tenant_id: selectedProject?.tenantId || "",
      };
      const blocksKey = window.process?.env.BLOCKS_X_BLOCKS_KEY || "";
      await mutateAsync(payload);
      impersonate(payload.targeted_tenant_id, blocksKey);
      isTriggering.current = false;
      setIsImpersonating(false);
    } catch (error) {
      console.error("Error during impersonation:", error);
      isTriggering.current = false;
      setIsImpersonating(false);
    }
  }, [
    impersonatedTenantId,
    selectedProject?.tenantId,
    mutateAsync,
    projects,
    setSelectedProject,
    setTenantGroup,
    impersonate,
  ]);

  useEffect(() => {
    if (!impersonatedTenantId && !selectedProject?.tenantId) return;
    if (isTriggering.current) return;
    if (impersonatedTenantId === selectedProject?.tenantId) return;
    runImpersonation();
  }, [impersonatedTenantId, selectedProject?.tenantId, runImpersonation]);

  if (isImpersonating) return <AppLoadingSpinner />;
  if (!isImpersonated || isTriggering.current) return null;
  return <>{children}</>;
}
