import { Button } from "@/components";
import { AppLoadingSpinner } from "@/components/common/loader-spinner";
import {
  useImpersonationStatusChecker,
  useStartImpersonation,
  useStopImpersonation,
} from "@/hooks/use-impersonation";
import { useGetProjects } from "@/hooks/use-project";
import { HttpError } from "@/lib/http/error";
import {
  claimTenant,
  readCurrentOwner,
  subscribeToTenantClaims,
} from "@/lib/tenant-ownership";
import { projectService } from "@/services/project.service";
import { useImpersonateStore, useProjectStore } from "@/store";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";

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

/**
 * Terminal state for a tab that must not render project data: either a repair failed, or another
 * tab has taken the shared cookie. Both need the same shape -- say what happened, offer the single
 * action that resolves it, and always leave a way back to the console.
 */
function ImpersonationBlocked({
  title,
  description,
  actionLabel,
  onAction,
  consolePath,
}: {
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
  consolePath: string;
}) {
  const navigate = useNavigate();

  return (
    <div className="flex h-full min-h-[320px] w-full flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="flex flex-col gap-1">
        <h2 className="text-base font-semibold">{title}</h2>
        <p className="max-w-md text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="flex flex-row items-center gap-2">
        <Button onClick={onAction}>{actionLabel}</Button>
        <Button variant="outline" onClick={() => navigate(consolePath)}>
          Back to console
        </Button>
      </div>
    </div>
  );
}

export function ImpersonationSynchronizer({
  children,
  consolePath = "/app/console",
}: {
  children: React.ReactNode;
  /** Where the escape hatches lead. Matches `DashboardRoute`'s own default. */
  consolePath?: string;
}) {
  const {
    impersonate,
    isImpersonated,
    impersonatedTenantId,
    impersonationError,
    isDetached,
    setImpersonationError,
    setDetached,
  } = useImpersonateStore();
  const { mutateAsync } = useStartImpersonation();
  const { data: _data } = useGetProjects({ enabled: true });
  const { selectedProject, setSelectedProject, projects, setTenantGroup } =
    useProjectStore();
  const isTriggering = useRef(false);
  const [isImpersonating, setIsImpersonating] = useState(false);
  const { itemId } = useParams<{ itemId: string }>();

  /**
   * The tenant this tab is *supposed* to be in, derived from the URL rather than from
   * `selectedProject`.
   *
   * The route is the only per-tab source of truth available. `selectedProject` was persisted to
   * localStorage, so it could arrive from a different tab entirely; the route cannot. The projects
   * list hydrates synchronously from storage, so this resolves on the first render in every case
   * except a genuinely cold first visit.
   *
   * `null` means "cannot resolve yet", which is emphatically not "wrong tenant" -- a project
   * created in another session simply is not in this tab's copy of the list. Conflating the two
   * would bounce people out of perfectly valid deep links.
   */
  const routeTenantId = useMemo(() => {
    if (!itemId) return null;
    return projects.find((p) => p.itemId === itemId)?.tenantId ?? null;
  }, [itemId, projects]);

  // Keep refs in sync so runImpersonation always reads latest values
  // without needing to be in its own dependency array
  const impersonatedTenantIdRef = useRef(impersonatedTenantId);
  const selectedProjectRef = useRef(selectedProject);
  const projectsRef = useRef(projects);
  const routeTenantIdRef = useRef(routeTenantId);

  impersonatedTenantIdRef.current = impersonatedTenantId;
  selectedProjectRef.current = selectedProject;
  projectsRef.current = projects;
  routeTenantIdRef.current = routeTenantId;

  // Seed effect — keeps the visible project in step with the route.
  useEffect(() => {
    if (!itemId || !projects.length) return;
    if (selectedProject?.itemId === itemId) return;
    const match = projects.find((p) => p.itemId === itemId);
    if (match) {
      setSelectedProject(match);
      setTenantGroup(match.tenantGroupId);
    }
  }, [
    itemId,
    selectedProject?.itemId,
    projects,
    setSelectedProject,
    setTenantGroup,
  ]);

  const getImpersonatedProject = async () => {
    try {
      const res = projectService.getProject();
      return (await res).data;
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  // Stable callback — reads latest values from refs, not from closure.
  // This means it never recreates due to selectedProject/projects/impersonatedTenantId
  // changing, which was causing the double-fire in Safari.
  const runImpersonation = useCallback(async () => {
    const targetTenantId = routeTenantIdRef.current;
    const currentTenantId = impersonatedTenantIdRef.current;
    const knownProjects = projectsRef.current;

    isTriggering.current = true;
    setIsImpersonating(true);
    try {
      // Cold start: the token is already impersonated but the route cannot be resolved, because
      // this tab has no copy of the projects list yet. Ask the server which project the current
      // token belongs to rather than re-impersonating on a guess.
      if (!targetTenantId) {
        if (currentTenantId && !selectedProjectRef.current) {
          const project =
            knownProjects.find((p) => p.tenantId === currentTenantId) ??
            (await getImpersonatedProject());
          if (project) {
            setSelectedProject(project);
            setTenantGroup(project.tenantGroupId);
          }
        }
        return;
      }

      // Retarget straight to the route's tenant. Deliberately not stop-then-start: the impersonate
      // endpoint already retargets an existing session, and stopping first costs two extra round
      // trips and leaves the cookie holding a root token in between.
      await mutateAsync({ targeted_tenant_id: targetTenantId });
      impersonate(
        targetTenantId,
        window.process?.env.BLOCKS_X_BLOCKS_KEY || "",
      );
      // This tab now owns the shared cookie; tell the others before they fetch under it.
      claimTenant(targetTenantId);

      const project = knownProjects.find((p) => p.tenantId === targetTenantId);
      if (project) {
        setSelectedProject(project);
        setTenantGroup(project.tenantGroupId);
      }
    } catch (error) {
      // Recorded, not swallowed. Losing this used to leave the store pinned to the previous
      // project's tenant while the route kept pointing at this one, which froze the trigger effect
      // below: its dependencies stopped changing, so it never ran again and the page kept rendering
      // another tenant's data indefinitely, with no error anywhere.
      setImpersonationError(error);
    } finally {
      isTriggering.current = false;
      setIsImpersonating(false);
    }
  }, [
    mutateAsync,
    impersonate,
    setSelectedProject,
    setTenantGroup,
    setImpersonationError,
  ]);

  const retry = useCallback(() => {
    setImpersonationError(null);
    setDetached(false);
    void runImpersonation();
  }, [runImpersonation, setImpersonationError, setDetached]);

  // Another tab taking the cookie is the one event this tab cannot observe for itself: the token is
  // HttpOnly, and the status endpoint is only refetched on window focus.
  useEffect(() => {
    const owner = readCurrentOwner();
    if (owner && routeTenantId && owner.tenantId !== routeTenantId) {
      setDetached(true);
    }
    return subscribeToTenantClaims((claim) => {
      const mine = routeTenantIdRef.current;
      if (!mine) return;
      setDetached(claim.tenantId !== mine);
    });
  }, [routeTenantId, setDetached]);

  useEffect(() => {
    if (!itemId) return;
    if (isTriggering.current) return;
    // A failed repair and a detached tab are both terminal: retrying on every render would hammer
    // the endpoint and flicker the UI. Both clear only through an explicit user action.
    if (impersonationError || isDetached) return;

    const needsColdStart =
      !routeTenantId && !!impersonatedTenantId && !selectedProject;
    const needsRetarget =
      !!routeTenantId && routeTenantId !== impersonatedTenantId;
    if (!needsColdStart && !needsRetarget) return;

    void runImpersonation();
  }, [
    itemId,
    routeTenantId,
    impersonatedTenantId,
    selectedProject,
    impersonationError,
    isDetached,
    runImpersonation,
  ]);

  if (isImpersonating) return <AppLoadingSpinner />;

  // Outside a project scope there is no tenant to agree about; preserve the original behaviour.
  if (!itemId) {
    if (!isImpersonated || isTriggering.current) return null;
    return <>{children}</>;
  }

  if (impersonationError) {
    return (
      <ImpersonationBlocked
        title="Could not open this project"
        description="We could not switch your session to this project. Retry, or go back to the console and pick a project again."
        actionLabel="Retry"
        onAction={retry}
        consolePath={consolePath}
      />
    );
  }

  if (isDetached) {
    return (
      <ImpersonationBlocked
        title="This project is open in another tab"
        description="Your session can only be in one project at a time. Use this tab instead, or return to the console."
        actionLabel="Use this tab"
        onAction={retry}
        consolePath={consolePath}
      />
    );
  }

  // The gate that matters. It used to read `isImpersonated`, a boolean that stays true while
  // impersonating the WRONG project -- which is how one tenant's rows came to be rendered under
  // another project's name. Nothing renders unless the tenant we are in is the tenant the URL
  // asked for.
  if (!routeTenantId) return <AppLoadingSpinner />;
  if (routeTenantId !== impersonatedTenantId) return <AppLoadingSpinner />;

  return <>{children}</>;
}
