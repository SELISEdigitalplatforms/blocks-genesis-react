import { Button } from "@/components";
import { AppLoadingSpinner } from "@/components/common/loader-spinner";
import {
  useImpersonationStatusChecker,
  useRecordClaimedTenant,
  useStartImpersonation,
  useStopImpersonation,
} from "@/hooks/use-impersonation";
import { useGetProjects } from "@/hooks/use-project";
import { HttpError } from "@/lib/http/error";
import {
  TAB_ID,
  type TenantClaim,
  claimTenant,
  holdTenant,
  isSameClaim,
  isTenantHeldElsewhere,
  readCurrentOwner,
  subscribeToTenantClaims,
} from "@/lib/tenant-ownership";
import type { IProject } from "@/models";
import { projectService } from "@/services/project.service";
import { useImpersonateStore, useProjectStore } from "@/store";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";

/** Resolves a tenant to the project name a user would recognise, or null if we cannot name it. */
const projectNameFor = (
  projects: IProject[],
  tenantId: string | null | undefined,
): string | null =>
  (tenantId && projects.find((p) => p.tenantId === tenantId)?.name) || null;

const claimKeyOf = (claim: TenantClaim | null): string | null =>
  claim ? `${claim.tabId}|${claim.tenantId}|${claim.ts}` : null;

/**
 * On mount, decides whether another live window is already working in the tenant the shared cookie
 * is in. Calls `onHeldElsewhere` if so, and returns true while it is still finding out -- the
 * caller must neither take nor release the cookie until then.
 *
 * The stored claim is only a lead, and two checks stand between it and a detached window:
 *
 * 1. The server's word. A claim matters only for the tenant the status endpoint says the cookie is
 *    in right now (`cookieTenantId`). One left by another user before a logout, or overtaken by a
 *    later stop or impersonation, names a tenant the cookie is no longer in, and is dropped without
 *    asking anyone. A fresh login is root-scoped, so it never waits here at all.
 * 2. A live answer. The claim outlives the tab that wrote it -- a reload gives the same tab a new
 *    `TAB_ID`, and a closed tab never withdraws its claim -- so the other tabs are asked, and only
 *    one still rendering that tenant replies.
 *
 * `tabId !== TAB_ID` still matters: the stored claim is the last one made by ANY window, including
 * this one, and reading back its own claim must not make a window think it was displaced.
 */
const useLiveOwnerProbe = ({
  cookieTenantId,
  ownTenantId,
  onHeldElsewhere,
}: {
  /** Where the server says the shared cookie is right now; null when it is root-scoped. */
  cookieTenantId: string | null;
  /** The tenant this window wants. Another window in the same tenant is no conflict. */
  ownTenantId: string | null;
  onHeldElsewhere: (tenantId: string) => void;
}): boolean => {
  // Read during render, not in an effect, so the caller's own effects are held back on the very
  // first commit rather than one commit too late.
  const foreignClaim = useMemo(() => {
    if (!cookieTenantId || !ownTenantId || cookieTenantId === ownTenantId) {
      return null;
    }
    const owner = readCurrentOwner();
    return owner && owner.tabId !== TAB_ID && owner.tenantId === cookieTenantId
      ? owner
      : null;
  }, [cookieTenantId, ownTenantId]);

  // Keyed by the claim's content: a re-read of the same claim is a new object, not a new question.
  const claimKey = claimKeyOf(foreignClaim);
  const [probedKey, setProbedKey] = useState<string | null>(null);
  const foreignClaimRef = useRef(foreignClaim);
  const onHeldElsewhereRef = useRef(onHeldElsewhere);
  foreignClaimRef.current = foreignClaim;
  onHeldElsewhereRef.current = onHeldElsewhere;

  useEffect(() => {
    const claim = foreignClaimRef.current;
    if (!claim || !claimKey) return;
    let cancelled = false;
    void isTenantHeldElsewhere(claim.tenantId).then((held) => {
      if (cancelled) return;
      // A newer claim arriving mid-probe has already been handled by the claim subscription.
      if (held && isSameClaim(readCurrentOwner(), claim)) {
        onHeldElsewhereRef.current(claim.tenantId);
      }
      setProbedKey(claimKey);
    });
    return () => {
      cancelled = true;
    };
  }, [claimKey]);

  return !!claimKey && probedKey !== claimKey;
};

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

/**
 * Terminal state for a window that must not render data: it either lost the shared session or
 * failed to take it. Says what happened, offers the one action that resolves it, and leaves a way
 * back to the console.
 *
 * `useNavigate` lives here rather than in the callers so the guards themselves stay renderable
 * outside a router until something actually goes wrong.
 */
function ImpersonationBlocked({
  title,
  description,
  primaryLabel,
  onPrimary,
  consolePath,
}: {
  title: string;
  description: string;
  /** Omitted when retrying cannot help, leaving the console as the only way forward. */
  primaryLabel?: string;
  onPrimary?: () => void;
  /** Omitted on console routes, which are already where that button would lead. */
  consolePath?: string;
}) {
  const navigate = useNavigate();

  return (
    <div className="flex h-full min-h-[320px] w-full flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="flex flex-col gap-1">
        <h2 className="text-base font-semibold">{title}</h2>
        <p className="max-w-md text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="flex flex-row items-center gap-2">
        {primaryLabel && onPrimary && (
          <Button onClick={onPrimary}>{primaryLabel}</Button>
        )}
        {consolePath && (
          <Button
            variant={primaryLabel && onPrimary ? "outline" : "default"}
            onClick={() => navigate(consolePath)}
          >
            Go to console
          </Button>
        )}
      </div>
    </div>
  );
}

/**
 * A wait with a reason. The guard now holds a window on a spinner in several situations -- taking
 * the session, waiting for the projects list -- and an unexplained spinner through a full round
 * trip reads as a hang.
 */
function ImpersonationWaiting({ label }: { label: string }) {
  return (
    <div className="flex h-full min-h-[320px] w-full flex-col items-center justify-center gap-3">
      <AppLoadingSpinner />
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

export function ImpersonationTerminator({
  children,
}: {
  children: React.ReactNode;
}) {
  const {
    terminate,
    isImpersonated,
    impersonatedTenantId,
    detachedReason,
    detachedTenantId,
    setDetached,
  } = useImpersonateStore();
  const { mutateAsync } = useStopImpersonation();
  const recordClaimedTenant = useRecordClaimedTenant();
  const { projects } = useProjectStore();
  const isTriggering = useRef(false);
  const [isTerminating, setIsTerminating] = useState(false);

  // A console route expects the root tenant, the same way a project route expects its own. Stopping
  // impersonation is therefore a claim like any other: it moves the shared cookie back to root.
  const rootTenantId = window.process?.env.BLOCKS_X_BLOCKS_KEY || "";

  // Trusting the stored claim on its own is what put "Your session is in <project>" on a single
  // tab's Back to console after a reload, and on a new user's first console visit.
  const isProbingOwner = useLiveOwnerProbe({
    cookieTenantId: isImpersonated ? impersonatedTenantId : null,
    ownTenantId: rootTenantId || null,
    onHeldElsewhere: (tenantId) => setDetached("another-project", tenantId),
  });

  useEffect(() => {
    if (!rootTenantId) return;
    return subscribeToTenantClaims((claim) => {
      // The cookie moved, so this tab's status moves with it. Leaving the cached "stopped" in place
      // is what made "Leave <project>" skip the stop call below.
      recordClaimedTenant(claim.tenantId, rootTenantId);
      if (claim.tenantId === rootTenantId) {
        setDetached(null);
        return;
      }
      setDetached("another-project", claim.tenantId);
    });
  }, [rootTenantId, setDetached, recordClaimedTenant]);

  // The detached state belongs to the tab, not the route, so it survives navigation. Only a project
  // elsewhere detaches a console: "console" is what a project page records when the session went
  // back to the console, and following its "Go to console" arrives exactly where the session is.
  // Read as a block, it put that tab on "Your session is in a project" -- naming no project,
  // because the tenant it held was root -- and took a second click to clear.
  const isDetached = detachedReason === "another-project";

  useEffect(() => {
    if (detachedReason === "console") setDetached(null);
  }, [detachedReason, setDetached]);

  useEffect(() => {
    if (isTriggering.current || !isImpersonated) return;
    // Another window is inside a project. Stopping here would pull the shared cookie back to root
    // underneath it -- the mirror of the bug this guard exists to prevent, and triggered by nothing
    // more than this window regaining focus and refetching its status.
    if (isDetached) return;
    // Not known yet whether that window exists. The spinner below covers the wait.
    if (isProbingOwner) return;

    isTriggering.current = true;
    setIsTerminating(true);

    const stopImpersonation = async () => {
      let sessionIsRootScoped = false;
      try {
        await mutateAsync(undefined);
        sessionIsRootScoped = true;
      } catch (error) {
        // Stop can 401 when impersonation is already cleared server-side.
        // Always clear local state so we do not re-trigger stop on next layout.
        if (!(error instanceof HttpError) || error.status !== 401) {
          console.error("Error stopping impersonation:", error);
        }
        // A 401 means the session is already root-scoped, which is the state we asked for.
        sessionIsRootScoped =
          error instanceof HttpError && error.status === 401;
      } finally {
        terminate(rootTenantId);
        // Tell the other windows the cookie is root again. Without this they keep their own
        // impersonated state, agree with their own route, and go on calling APIs under a token that
        // now points at root -- which is how a project page came to list the console's users.
        if (sessionIsRootScoped && rootTenantId) claimTenant(rootTenantId);
        isTriggering.current = false;
        setIsTerminating(false);
      }
    };

    void stopImpersonation();
  }, [
    mutateAsync,
    terminate,
    isImpersonated,
    isDetached,
    isProbingOwner,
    rootTenantId,
  ]);

  if (isDetached) {
    const name = projectNameFor(projects, detachedTenantId);
    return (
      <ImpersonationBlocked
        title={
          name ? `Your session is in ${name}` : "Your session is in a project"
        }
        description="The project is open in another window. A session can only be in one place at a time."
        primaryLabel={name ? `Leave ${name}` : "Leave the project"}
        onPrimary={() => setDetached(null)}
      />
    );
  }

  if (isImpersonated || isTerminating) {
    return <ImpersonationWaiting label="Returning to the console…" />;
  }
  return <>{children}</>;
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
    detachedReason,
    detachedTenantId,
    setImpersonationError,
    setDetached,
  } = useImpersonateStore();
  const { mutateAsync } = useStartImpersonation();
  const recordClaimedTenant = useRecordClaimedTenant();
  const { data: _data } = useGetProjects({ enabled: true });
  const { selectedProject, setSelectedProject, projects, setTenantGroup } =
    useProjectStore();
  const isTriggering = useRef(false);
  const [isImpersonating, setIsImpersonating] = useState(false);
  const { itemId } = useParams<{ itemId: string }>();

  const rootTenantId = window.process?.env.BLOCKS_X_BLOCKS_KEY || "";

  /**
   * The tenant this window is *supposed* to be in, derived from the URL rather than from
   * `selectedProject`.
   *
   * The route is the only per-window source of truth available. `selectedProject` was persisted to
   * localStorage, so it could arrive from a different window entirely; the route cannot. The
   * projects list hydrates synchronously from storage, so this resolves on the first render in
   * every case except a genuinely cold first visit.
   *
   * `null` means "cannot resolve yet", which is emphatically not "wrong tenant" -- a project
   * created in another session simply is not in this window's copy of the list. Conflating the two
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
      // this window has no copy of the projects list yet. Ask the server which project the current
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
      // useStartImpersonation claims the tenant for this window on success, so every entry path --
      // this guard and the environment cards alike -- tells the other tabs that the shared cookie
      // just moved.
      await mutateAsync({ targeted_tenant_id: targetTenantId });
      impersonate(targetTenantId, rootTenantId);

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
    rootTenantId,
    setSelectedProject,
    setTenantGroup,
    setImpersonationError,
  ]);

  const takeSession = useCallback(() => {
    setImpersonationError(null);
    setDetached(null);
    void runImpersonation();
  }, [runImpersonation, setImpersonationError, setDetached]);

  /**
   * Whether this window opened while another one is still working in a different project. The
   * impersonation effect below runs in the same commit and must already see that it has to wait.
   *
   * A root-scoped cookie has nothing to check: `impersonatedTenantId` is null, so a stored ROOT
   * claim never makes a newly opened project start on "Your session returned to the console". A
   * console window that releases the cookie while this one is open still detaches it, through the
   * subscription below.
   */
  // The detached state belongs to the tab, not the route, so it survives navigation. A console
  // blocked by "Your session is in <project>" whose user then opens that very project has no
  // conflict left: this window wants the tenant the session is already in.
  const detachedHere =
    detachedReason === "another-project" && detachedTenantId === routeTenantId
      ? null
      : detachedReason;

  useEffect(() => {
    if (detachedReason && detachedReason !== detachedHere) setDetached(null);
  }, [detachedReason, detachedHere, setDetached]);

  const isProbingOwner = useLiveOwnerProbe({
    cookieTenantId: impersonatedTenantId,
    ownTenantId: routeTenantId,
    onHeldElsewhere: (tenantId) => setDetached("another-project", tenantId),
  });

  // Answer other tabs' probes for this project, but only while actually rendering its data.
  const isAttached =
    !!routeTenantId &&
    routeTenantId === impersonatedTenantId &&
    !detachedHere &&
    !impersonationError &&
    !isProbingOwner;

  useEffect(() => {
    if (!isAttached || !routeTenantId) return;
    return holdTenant(routeTenantId);
  }, [isAttached, routeTenantId]);

  // Another window taking the cookie is the one event this window cannot observe for itself: the
  // token is HttpOnly, and the status endpoint is only refetched when the tab becomes visible --
  // never, for two windows side by side.
  useEffect(() => {
    return subscribeToTenantClaims((claim) => {
      // Recorded even when this window has no tenant to compare yet: the cookie moved regardless.
      recordClaimedTenant(claim.tenantId, rootTenantId);
      const mine = routeTenantIdRef.current;
      if (!mine) return;
      // Another window on the SAME project is no conflict -- one cookie serves both.
      if (claim.tenantId === mine) {
        setDetached(null);
        return;
      }
      setDetached(
        claim.tenantId === rootTenantId ? "console" : "another-project",
        claim.tenantId,
      );
    });
  }, [routeTenantId, rootTenantId, setDetached, recordClaimedTenant]);

  useEffect(() => {
    if (!itemId) return;
    if (isTriggering.current) return;
    // A failed repair and a detached window are both terminal: retrying on every render would
    // hammer the endpoint and flicker the UI. Both clear only through an explicit user action.
    if (impersonationError || detachedHere) return;
    // Taking the cookie before knowing whether another window is in it would yank it from that
    // window -- exactly what the probe is there to rule out.
    if (isProbingOwner) return;

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
    detachedHere,
    isProbingOwner,
    runImpersonation,
  ]);

  const thisProjectName = projectNameFor(projects, routeTenantId);

  if (isImpersonating) {
    return (
      <ImpersonationWaiting
        label={
          thisProjectName ? `Opening ${thisProjectName}…` : "Opening project…"
        }
      />
    );
  }

  // Outside a project scope there is no tenant to agree about; preserve the original behaviour.
  if (!itemId) {
    if (!isImpersonated || isTriggering.current) return null;
    return <>{children}</>;
  }

  if (isProbingOwner && !detachedHere) {
    return (
      <ImpersonationWaiting
        label={
          thisProjectName ? `Opening ${thisProjectName}…` : "Opening project…"
        }
      />
    );
  }

  if (impersonationError) {
    // Retrying a revoked access check just teaches people the button does nothing, so 403 gets its
    // own message and no retry.
    const accessDenied =
      impersonationError instanceof HttpError &&
      impersonationError.status === 403;

    return accessDenied ? (
      <ImpersonationBlocked
        title={
          thisProjectName
            ? `You don't have access to ${thisProjectName}`
            : "You don't have access to this project"
        }
        description="Your access to this project may have been removed. Pick another project from the console."
        consolePath={consolePath}
      />
    ) : (
      <ImpersonationBlocked
        title={
          thisProjectName
            ? `Couldn't open ${thisProjectName}`
            : "Couldn't open this project"
        }
        description="Something went wrong switching to this project. Try again, or pick a different one from the console."
        primaryLabel="Try again"
        onPrimary={takeSession}
        consolePath={consolePath}
      />
    );
  }

  if (detachedHere === "console") {
    return (
      <ImpersonationBlocked
        title="Your session returned to the console"
        description={
          thisProjectName
            ? `You went back to the console in another window, so ${thisProjectName} is no longer open here.`
            : "You went back to the console in another window, so this project is no longer open here."
        }
        primaryLabel={
          thisProjectName ? `Reopen ${thisProjectName}` : "Reopen this project"
        }
        onPrimary={takeSession}
        consolePath={consolePath}
      />
    );
  }

  if (detachedHere === "another-project") {
    const otherName = projectNameFor(projects, detachedTenantId);
    return (
      <ImpersonationBlocked
        title="Another project is open in this browser"
        description={
          otherName
            ? `Your session moved to ${otherName} in another window. A session can only be in one project at a time.`
            : "Your session moved to another project in a different window. A session can only be in one project at a time."
        }
        primaryLabel={
          thisProjectName
            ? `Continue in ${thisProjectName}`
            : "Continue in this project"
        }
        onPrimary={takeSession}
        consolePath={consolePath}
      />
    );
  }

  // The gate that matters. It used to read `isImpersonated`, a boolean that stays true while
  // impersonating the WRONG project -- which is how one tenant's rows came to be rendered under
  // another project's name. Nothing renders unless the tenant we are in is the tenant the URL
  // asked for.
  if (!routeTenantId)
    return <ImpersonationWaiting label="Loading your projects…" />;
  if (routeTenantId !== impersonatedTenantId) {
    return (
      <ImpersonationWaiting
        label={
          thisProjectName
            ? `Switching to ${thisProjectName}…`
            : "Switching projects…"
        }
      />
    );
  }

  return <>{children}</>;
}
