import { AppLoadingSpinner } from "@/components/common/loader-spinner";
import {
  useImpersonationStatusChecker,
  useStartImpersonation,
  useStopImpersonation,
} from "@/hooks/use-auth-api";
import { useGetProjects } from "@/hooks/use-project";
import type { ImpersonationRequest } from "@/services/impersonation.service";
import { useImpersonateStore, useProjectStore } from "@/store";
import { useCallback, useEffect, useRef, useState } from "react";
import { projectService } from "@/services/project.service";

export const ImpersonationChecker = ({ children }: { children: React.ReactNode }) => {
  const { data, isLoading, isSuccess } = useImpersonationStatusChecker();
  const { setImpersonation, isInitialized, setInitialized } = useImpersonateStore();

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

export function ImpersonationTerminator({ children }: { children: React.ReactNode }) {
  const { terminate, isImpersonated } = useImpersonateStore();
  const { mutateAsync } = useStopImpersonation();
  const isTriggering = useRef(false);

  useEffect(() => {
    if (isTriggering.current || !isImpersonated) return;
    isTriggering.current = true;
    const blocksKey = window.process?.env.BLOCKS_X_BLOCKS_KEY || "";
    mutateAsync(undefined)
      .then(() => {
        terminate(blocksKey);
        isTriggering.current = false;
      })
      .catch(() => {
        isTriggering.current = false;
      });
  }, [mutateAsync, terminate, isImpersonated, isTriggering]);

  if (isImpersonated || isTriggering.current) return <AppLoadingSpinner />;
  return <>{children}</>;
}

export function ImpersonationSynchronizer({ children }: { children: React.ReactNode }) {
  useGetProjects();
  const { impersonate, isImpersonated, impersonatedTenantId } = useImpersonateStore();
  const { mutateAsync } = useStartImpersonation();

  const { selectedProject, setSelectedProject, projects, setTenantGroup } = useProjectStore();
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const inflightRef = useRef<string | null>(null); // tracks which tenantId is in-flight

  const getProject = useCallback(async (tenantId: string) => {
    const res = await projectService.getProject({ projectId: tenantId });
    return res.data;
  }, []);

  useEffect(() => {
    const targetId = impersonatedTenantId ?? selectedProject?.tenantId;
    if (!targetId) return;
    if (impersonatedTenantId === selectedProject?.tenantId) return;
    if (inflightRef.current === targetId) return; // dedupe

    inflightRef.current = targetId;
    setStatus("loading");

    const run = async () => {
      try {
        if (impersonatedTenantId) {
          // Sync store to match already-impersonated tenant
          let project = projects.find((p) => p.tenantId === impersonatedTenantId);
          if (!project) project = await getProject(impersonatedTenantId);
          if (!project) throw new Error(`Project not found: ${impersonatedTenantId}`);
          setSelectedProject(project);
          setTenantGroup(project.tenantGroupId);
        } else {
          // Start new impersonation for selected project
          const payload: ImpersonationRequest = {
            targeted_tenant_id: selectedProject!.tenantId,
          };
          await mutateAsync(payload);
          const blocksKey = window.process?.env.BLOCKS_X_BLOCKS_KEY ?? "";
          impersonate(payload.targeted_tenant_id, blocksKey);
        }
        setStatus("idle");
      } catch (err) {
        console.error("Impersonation error:", err);
        setStatus("error");
      } finally {
        inflightRef.current = null;
      }
    };

    run();
  }, [
    impersonatedTenantId,
    selectedProject?.tenantId,
    projects,
    mutateAsync,
    impersonate,
    getProject,
    setSelectedProject,
    setTenantGroup,
    selectedProject,
  ]);

  if (status === "loading") return <AppLoadingSpinner />;
  if (!isImpersonated) return null;
  return <>{children}</>;
}
