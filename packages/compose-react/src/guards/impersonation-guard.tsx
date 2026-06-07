import { AppLoadingSpinner } from "@/components/common/loader-spinner";
import {
  useImpersonationStatusChecker,
  useStartImpersonation,
  useStopImpersonation,
} from "@/hooks/use-auth-api";
import type { ImpersonationRequest } from "@/services/impersonation.service";
import { useImpersonateStore, useProjectStore } from "@/store";
import { useEffect, useRef, useState } from "react";

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
  console.log("Impersonation status: 2133", { data, isLoading, isSuccess, isInitialized });
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
  const { impersonate, isImpersonated, impersonatedTenantId } = useImpersonateStore();
  const { mutateAsync } = useStartImpersonation();

  const { selectedProject, setSelectedProject, projects } = useProjectStore();
  const isTriggering = useRef(false);
  const [isImpersonating, setIsImpersonating] = useState(false);

  useEffect(() => {
    if (!impersonatedTenantId) return;
    if (isTriggering.current) return;

    isTriggering.current = true;
    setIsImpersonating(true);
    const payload: ImpersonationRequest = {
      targeted_tenant_id: impersonatedTenantId,
    };
    const project = projects.find((project) => project.tenantId === impersonatedTenantId);
    if (!project) return;
    const blocksKey = window.process?.env.BLOCKS_X_BLOCKS_KEY || "";
    mutateAsync(payload)
      .then(() => {
        impersonate(impersonatedTenantId, blocksKey);
        setSelectedProject(project);
        isTriggering.current = false;
        setIsImpersonating(false);
      })
      .catch(() => {
        isTriggering.current = false;
        setIsImpersonating(false);
      });
  }, [mutateAsync, impersonate, impersonatedTenantId, isTriggering, projects, setSelectedProject]);
  if (isImpersonating) return <AppLoadingSpinner />;
  if (!isImpersonated || isTriggering.current) return null;
  return <>{children}</>;
}
