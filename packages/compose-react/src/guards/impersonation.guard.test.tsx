import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";

type Claim = { tenantId: string; tabId: string; ts: number };

const h = vi.hoisted(() => ({
  status: { data: undefined as unknown, isLoading: true, isSuccess: false },
  stopMutate: vi.fn(),
  startMutate: vi.fn(),
  projects: { data: undefined as unknown },
  claimTenant: vi.fn(),
  recordClaimedTenant: vi.fn(),
  holdTenant: vi.fn(),
  // What the probe reports back: is a live tab still inside the claimed tenant?
  heldElsewhere: vi.fn(),
  currentOwner: null as { tenantId: string; tabId: string; ts: number } | null,
  onClaim: undefined as
    | ((claim: { tenantId: string; tabId: string; ts: number }) => void)
    | undefined,
}));

// Driving the subscription callback directly keeps these tests about the guard's use of tenant
// ownership rather than about BroadcastChannel's semantics under jsdom.
vi.mock("@/lib/tenant-ownership", () => ({
  TAB_ID: "this-tab",
  claimTenant: h.claimTenant,
  holdTenant: h.holdTenant,
  isTenantHeldElsewhere: h.heldElsewhere,
  isSameClaim: (a: Claim | null, b: Claim | null) =>
    !!a &&
    !!b &&
    a.tabId === b.tabId &&
    a.tenantId === b.tenantId &&
    a.ts === b.ts,
  readCurrentOwner: () => h.currentOwner,
  subscribeToTenantClaims: (cb: (claim: Claim) => void) => {
    h.onClaim = cb;
    return () => {
      h.onClaim = undefined;
    };
  },
}));

vi.mock("@/hooks/use-impersonation", () => ({
  useImpersonationStatusChecker: () => h.status,
  useStopImpersonation: () => ({ mutateAsync: h.stopMutate }),
  useStartImpersonation: () => ({ mutateAsync: h.startMutate }),
  useRecordClaimedTenant: () => h.recordClaimedTenant,
}));
vi.mock("@/hooks/use-project", () => ({ useGetProjects: () => h.projects }));
vi.mock("@/services/project.service", () => ({
  projectService: {
    getProject: vi
      .fn()
      .mockResolvedValue({ data: { tenantId: "t1", tenantGroupId: "tg1" } }),
  },
}));

import {
  ImpersonationChecker,
  ImpersonationTerminator,
  ImpersonationSynchronizer,
} from "@/guards/impersonation.guard";
import { HttpError } from "@/lib/http/error";
import { useImpersonateStore, useProjectStore } from "@/store";

const ROOT_KEY = "root-key";

beforeEach(() => {
  (window as unknown as { process?: { env: Record<string, string> } }).process =
    { env: { BLOCKS_X_BLOCKS_KEY: ROOT_KEY } };
  useImpersonateStore.getState().reset();
  useProjectStore.getState().resetProjectStore();
  h.status = { data: undefined, isLoading: true, isSuccess: false };
  h.stopMutate.mockReset().mockResolvedValue(undefined);
  h.startMutate.mockReset().mockResolvedValue(undefined);
  h.projects = { data: undefined };
  h.claimTenant.mockReset();
  h.recordClaimedTenant.mockReset();
  h.holdTenant.mockReset().mockReturnValue(() => undefined);
  h.heldElsewhere.mockReset().mockResolvedValue(false);
  h.currentOwner = null;
  h.onClaim = undefined;
});

describe("ImpersonationChecker", () => {
  it("renders nothing while the status is loading", () => {
    const { container } = render(
      <ImpersonationChecker>
        <div>child</div>
      </ImpersonationChecker>,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders children once the status resolves", () => {
    h.status = {
      data: {
        impersonated: false,
        originalTenantId: "orig",
        impersonatedTenantId: null,
      },
      isLoading: false,
      isSuccess: true,
    };
    render(
      <ImpersonationChecker>
        <div>child</div>
      </ImpersonationChecker>,
    );
    expect(screen.getByText("child")).toBeInTheDocument();
  });
});

describe("ImpersonationTerminator", () => {
  it("renders children when not impersonating", () => {
    render(
      <ImpersonationTerminator>
        <div>child</div>
      </ImpersonationTerminator>,
    );
    expect(screen.getByText("child")).toBeInTheDocument();
  });

  it("terminates an active impersonation then renders children", async () => {
    useImpersonateStore.getState().impersonate("imp", "orig");
    render(
      <ImpersonationTerminator>
        <div>child</div>
      </ImpersonationTerminator>,
    );
    expect(await screen.findByText("child")).toBeInTheDocument();
    expect(h.stopMutate).toHaveBeenCalled();
  });
});

describe("ImpersonationSynchronizer", () => {
  it("renders nothing when not impersonated", () => {
    const { container } = render(
      <ImpersonationSynchronizer>
        <div>child</div>
      </ImpersonationSynchronizer>,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders children when impersonated and already in sync", () => {
    useImpersonateStore.getState().setImpersonation(true, "orig", "t1");
    useProjectStore
      .getState()
      .setSelectedProject({ tenantId: "t1", tenantGroupId: "tg1" } as never);
    render(
      <ImpersonationSynchronizer>
        <div>child</div>
      </ImpersonationSynchronizer>,
    );
    expect(screen.getByText("child")).toBeInTheDocument();
  });
});

describe("ImpersonationSynchronizer inside a project route", () => {
  const P1 = {
    itemId: "p1",
    tenantId: "t1",
    tenantGroupId: "tg1",
    name: "Test Construct",
  };

  const renderAt = (itemId: string) =>
    render(
      <MemoryRouter initialEntries={[`/app/${itemId}`]}>
        <Routes>
          <Route
            path="/app/:itemId"
            element={
              <ImpersonationSynchronizer>
                <div>child</div>
              </ImpersonationSynchronizer>
            }
          />
        </Routes>
      </MemoryRouter>,
    );

  it("renders children when the route's tenant is the impersonated tenant", () => {
    useProjectStore.getState().setProjects([P1] as never);
    useImpersonateStore.getState().setImpersonation(true, "orig", "t1");

    renderAt("p1");

    expect(screen.getByText("child")).toBeInTheDocument();
  });

  it("never renders children while impersonating a different tenant", async () => {
    useProjectStore.getState().setProjects([P1] as never);
    // Impersonated somewhere else — the shape another tab's claim leaves behind.
    useImpersonateStore.getState().setImpersonation(true, "orig", "t2");

    renderAt("p1");

    // The regression this guards: the old gate read `isImpersonated`, which is true here.
    expect(screen.queryByText("child")).toBeNull();
    await waitFor(() =>
      expect(h.startMutate).toHaveBeenCalledWith({ targeted_tenant_id: "t1" }),
    );
  });

  it("waits, rather than treating an unresolvable route as a mismatch", () => {
    // Projects list not hydrated yet: a cold first visit, or a project created elsewhere.
    useImpersonateStore.getState().setImpersonation(true, "orig", "t1");

    renderAt("p1");

    expect(screen.queryByText("child")).toBeNull();
    // Must not re-impersonate on a guess while the route is unresolved.
    expect(h.startMutate).not.toHaveBeenCalled();
  });

  it("surfaces a failed impersonation and does not retry on its own", async () => {
    h.startMutate.mockRejectedValue(new Error("nope"));
    useProjectStore.getState().setProjects([P1] as never);
    useImpersonateStore.getState().setImpersonation(true, "orig", "t2");

    renderAt("p1");

    expect(
      await screen.findByText("Couldn't open Test Construct"),
    ).toBeInTheDocument();
    expect(screen.queryByText("child")).toBeNull();
    // Previously the failure was swallowed and the effect's deps froze; assert we neither loop
    // nor silently give up and render the wrong tenant.
    expect(h.startMutate).toHaveBeenCalledTimes(1);
  });

  it("detaches when another tab claims a different tenant", async () => {
    useProjectStore.getState().setProjects([P1] as never);
    useImpersonateStore.getState().setImpersonation(true, "orig", "t1");

    renderAt("p1");
    expect(screen.getByText("child")).toBeInTheDocument();

    act(() => {
      h.onClaim?.({ tenantId: "t2", tabId: "another-tab", ts: Date.now() });
    });

    expect(
      await screen.findByText("Another project is open in this browser"),
    ).toBeInTheDocument();
    expect(screen.queryByText("child")).toBeNull();
  });

  it("names the console when the console takes the session back", async () => {
    useProjectStore.getState().setProjects([P1] as never);
    useImpersonateStore.getState().setImpersonation(true, ROOT_KEY, "t1");

    renderAt("p1");
    expect(screen.getByText("child")).toBeInTheDocument();

    // The console releasing the cookie is a claim for the ROOT tenant, not for a project.
    act(() => {
      h.onClaim?.({ tenantId: ROOT_KEY, tabId: "console-tab", ts: Date.now() });
    });

    expect(
      await screen.findByText("Your session returned to the console"),
    ).toBeInTheDocument();
    // Telling someone their project is "open in another window" when they went back to the console
    // would send them looking for a window that is not there.
    expect(
      screen.queryByText("Another project is open in this browser"),
    ).toBeNull();
    expect(screen.getByText("Reopen Test Construct")).toBeInTheDocument();
  });

  it("records where another window moved the cookie", async () => {
    useProjectStore.getState().setProjects([P1] as never);
    useImpersonateStore.getState().setImpersonation(true, ROOT_KEY, "t1");

    renderAt("p1");

    act(() => {
      h.onClaim?.({ tenantId: ROOT_KEY, tabId: "console-tab", ts: Date.now() });
    });

    expect(h.recordClaimedTenant).toHaveBeenCalledWith(ROOT_KEY, ROOT_KEY);
    expect(
      await screen.findByText("Your session returned to the console"),
    ).toBeInTheDocument();
  });

  it("opens the very project a blocked console said the session was in", () => {
    // Left over from the console: "Your session is in Test Construct", then back to that project.
    useProjectStore.getState().setProjects([P1] as never);
    useImpersonateStore.getState().setImpersonation(true, ROOT_KEY, "t1");
    useImpersonateStore.getState().setDetached("another-project", "t1");

    renderAt("p1");

    expect(screen.getByText("child")).toBeInTheDocument();
    expect(useImpersonateStore.getState().detachedReason).toBeNull();
  });

  it("stays attached when another window opens the SAME project", () => {
    useProjectStore.getState().setProjects([P1] as never);
    useImpersonateStore.getState().setImpersonation(true, ROOT_KEY, "t1");

    renderAt("p1");

    act(() => {
      h.onClaim?.({ tenantId: "t1", tabId: "other-tab", ts: Date.now() });
    });

    // One cookie serves both windows when they want the same project; blocking would be noise.
    expect(screen.getByText("child")).toBeInTheDocument();
  });

  it("offers no retry when access to the project is denied", async () => {
    h.startMutate.mockRejectedValue(new HttpError(403, { errors: {} }));
    useProjectStore.getState().setProjects([P1] as never);
    useImpersonateStore.getState().setImpersonation(true, ROOT_KEY, "t2");

    renderAt("p1");

    expect(
      await screen.findByText("You don't have access to Test Construct"),
    ).toBeInTheDocument();
    // Retrying a revoked access check only teaches people the button does nothing.
    expect(screen.queryByText("Try again")).toBeNull();
    expect(screen.getByText("Go to console")).toBeInTheDocument();
  });

  // The start-side claim moved into useStartImpersonation so that the environment cards -- which
  // call the hook directly and never reach this guard -- claim too. It is covered in
  // hooks/use-impersonation.test.tsx; the stop-side claim below is still this guard's own.

  it("ignores a stored claim made by this same tab", async () => {
    // Navigating project -> project inside one tab reads back that tab's own previous claim.
    // Treating it as someone else's would strand the tab on a notice it wrote itself.
    h.currentOwner = { tenantId: "t2", tabId: "this-tab", ts: 1 };
    useProjectStore.getState().setProjects([P1] as never);
    useImpersonateStore.getState().setImpersonation(true, "orig", "t1");

    renderAt("p1");

    expect(screen.getByText("child")).toBeInTheDocument();
    expect(
      screen.queryByText("Another project is open in this browser"),
    ).toBeNull();
  });

  it("detaches on mount when another tab already owns a different tenant", async () => {
    h.currentOwner = { tenantId: "t2", tabId: "another-tab", ts: 1 };
    h.heldElsewhere.mockResolvedValue(true);
    useProjectStore.getState().setProjects([P1] as never);
    // The server agrees the cookie is in t2, so the claim is worth asking about.
    useImpersonateStore.getState().setImpersonation(true, "orig", "t2");

    renderAt("p1");

    expect(
      await screen.findByText("Another project is open in this browser"),
    ).toBeInTheDocument();
  });

  it("ignores a stored claim no live tab holds any more", async () => {
    // Left by this same tab before a reload (new TAB_ID), or by a tab since closed.
    h.currentOwner = { tenantId: "t2", tabId: "previous-page-load", ts: 1 };
    useProjectStore.getState().setProjects([P1] as never);
    useImpersonateStore.getState().setImpersonation(true, "orig", "t2");

    renderAt("p1");

    await waitFor(() =>
      expect(h.startMutate).toHaveBeenCalledWith({ targeted_tenant_id: "t1" }),
    );
    expect(h.heldElsewhere).toHaveBeenCalledWith("t2");
    expect(
      screen.queryByText("Another project is open in this browser"),
    ).toBeNull();
  });

  it("does not take the cookie while it is still asking who holds it", async () => {
    h.currentOwner = { tenantId: "t2", tabId: "another-tab", ts: 1 };
    let answer: (held: boolean) => void = () => undefined;
    h.heldElsewhere.mockReturnValue(
      new Promise<boolean>((resolve) => {
        answer = resolve;
      }),
    );
    useProjectStore.getState().setProjects([P1] as never);
    useImpersonateStore.getState().setImpersonation(true, "orig", "t2");

    renderAt("p1");

    expect(screen.getByText("Opening Test Construct…")).toBeInTheDocument();
    expect(h.startMutate).not.toHaveBeenCalled();

    await act(async () => {
      answer(true);
    });

    expect(
      await screen.findByText("Another project is open in this browser"),
    ).toBeInTheDocument();
    expect(h.startMutate).not.toHaveBeenCalled();
  });

  it("does not treat a stored console claim as a conflict on open", () => {
    // Opening a project in a new tab from the console used to start on "returned to the console".
    h.currentOwner = { tenantId: ROOT_KEY, tabId: "console-tab", ts: 1 };
    useProjectStore.getState().setProjects([P1] as never);
    useImpersonateStore.getState().setImpersonation(true, ROOT_KEY, "t1");

    renderAt("p1");

    expect(screen.getByText("child")).toBeInTheDocument();
    expect(h.heldElsewhere).not.toHaveBeenCalled();
  });

  it("drops a claim for a tenant the cookie is no longer in, without asking", () => {
    // Overtaken since: the server says the cookie is back in this route's tenant.
    h.currentOwner = { tenantId: "t2", tabId: "another-tab", ts: 1 };
    useProjectStore.getState().setProjects([P1] as never);
    useImpersonateStore.getState().setImpersonation(true, "orig", "t1");

    renderAt("p1");

    expect(screen.getByText("child")).toBeInTheDocument();
    expect(h.heldElsewhere).not.toHaveBeenCalled();
  });

  it("holds its tenant only while rendering it", async () => {
    useProjectStore.getState().setProjects([P1] as never);
    useImpersonateStore.getState().setImpersonation(true, "orig", "t1");

    renderAt("p1");
    expect(h.holdTenant).toHaveBeenCalledWith("t1");

    const release = vi.fn();
    h.holdTenant.mockReturnValue(release);
    h.holdTenant.mockClear();
    act(() => {
      h.onClaim?.({ tenantId: "t2", tabId: "another-tab", ts: Date.now() });
    });

    await screen.findByText("Another project is open in this browser");
    expect(h.holdTenant).not.toHaveBeenCalled();
  });
});

describe("ImpersonationTerminator and the shared cookie", () => {
  const ROOT = ROOT_KEY;

  const renderTerminator = () =>
    render(
      <MemoryRouter>
        <ImpersonationTerminator>
          <div>console</div>
        </ImpersonationTerminator>
      </MemoryRouter>,
    );

  it("announces the release so project windows learn the cookie went back to root", async () => {
    useImpersonateStore.getState().setImpersonation(true, ROOT, "t1");

    renderTerminator();

    await waitFor(() => expect(h.stopMutate).toHaveBeenCalled());
    // Without this the other window keeps its own impersonated state, agrees with its own route,
    // and goes on calling APIs under a token that now points at root.
    await waitFor(() => expect(h.claimTenant).toHaveBeenCalledWith(ROOT));
  });

  it("does not pull the cookie back while another window is inside a project", async () => {
    useImpersonateStore.getState().setImpersonation(true, ROOT, "t1");

    renderTerminator();
    await waitFor(() => expect(h.stopMutate).toHaveBeenCalledTimes(1));
    h.stopMutate.mockClear();

    act(() => {
      h.onClaim?.({ tenantId: "t1", tabId: "another-tab", ts: Date.now() });
    });

    expect(
      await screen.findByText("Your session is in a project"),
    ).toBeInTheDocument();
    // Stopping here would yank the cookie out from under the other window on nothing more than
    // this one regaining focus.
    expect(h.stopMutate).not.toHaveBeenCalled();
  });

  it("returns to the console after a reload, with no other window open", async () => {
    // The reported bug: open a project, reload it, click Back to console. The stored claim is this
    // tab's own, written under the TAB_ID it had before the reload.
    h.currentOwner = { tenantId: "t1", tabId: "previous-page-load", ts: 1 };
    useImpersonateStore.getState().setImpersonation(true, ROOT, "t1");

    renderTerminator();

    expect(await screen.findByText("console")).toBeInTheDocument();
    expect(h.stopMutate).toHaveBeenCalledTimes(1);
    expect(screen.queryByText("Your session is in a project")).toBeNull();
  });

  it("stays out of a project another live window is inside", async () => {
    h.currentOwner = { tenantId: "t1", tabId: "another-tab", ts: 1 };
    h.heldElsewhere.mockResolvedValue(true);
    useImpersonateStore.getState().setImpersonation(true, ROOT, "t1");

    renderTerminator();

    expect(
      await screen.findByText("Your session is in a project"),
    ).toBeInTheDocument();
    expect(h.stopMutate).not.toHaveBeenCalled();
  });

  it("shows a new user the console, whatever the previous user left behind", () => {
    // A fresh login is root-scoped; a claim from the previous session names a tenant it is not in.
    h.currentOwner = { tenantId: "t1", tabId: "previous-user-tab", ts: 1 };
    useImpersonateStore.getState().setImpersonation(false, ROOT, null);

    renderTerminator();

    expect(screen.getByText("console")).toBeInTheDocument();
    expect(h.heldElsewhere).not.toHaveBeenCalled();
    expect(screen.queryByText("Your session is in a project")).toBeNull();
  });

  it("stops for real on Leave after another window re-entered a project", async () => {
    // This window already stopped, so its cached status says root. Two windows side by side never
    // fire visibilitychange, so nothing refetches it.
    useImpersonateStore.getState().setImpersonation(false, ROOT, null);
    // Stand-in for ImpersonationChecker syncing the store from the status the claim was recorded in.
    h.recordClaimedTenant.mockImplementation((tenantId: string) =>
      useImpersonateStore
        .getState()
        .setImpersonation(
          tenantId !== ROOT,
          ROOT,
          tenantId === ROOT ? null : tenantId,
        ),
    );

    renderTerminator();
    expect(screen.getByText("console")).toBeInTheDocument();

    act(() => {
      h.onClaim?.({ tenantId: "t1", tabId: "another-tab", ts: Date.now() });
    });

    expect(h.recordClaimedTenant).toHaveBeenCalledWith("t1", ROOT);
    expect(
      await screen.findByText("Your session is in a project"),
    ).toBeInTheDocument();
    expect(h.stopMutate).not.toHaveBeenCalled();

    fireEvent.click(screen.getByText("Leave the project"));

    // Before the fix Leave only cleared the notice: the stale "not impersonated" skipped the stop,
    // and the console rendered under the project's token.
    await waitFor(() => expect(h.stopMutate).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(h.claimTenant).toHaveBeenCalledWith(ROOT));
  });

  it("opens straight away when a project page sends this tab back with Go to console", () => {
    // Left over from the project page: "Your session returned to the console".
    useImpersonateStore.getState().setImpersonation(false, ROOT, null);
    useImpersonateStore.getState().setDetached("console", ROOT);

    renderTerminator();

    // It used to block on "Your session is in a project" and take a second click.
    expect(screen.getByText("console")).toBeInTheDocument();
    expect(screen.queryByText("Your session is in a project")).toBeNull();
    expect(useImpersonateStore.getState().detachedReason).toBeNull();
  });
});
