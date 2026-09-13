import { describe, it, expect, vi, beforeEach } from "vitest";
import { act, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";

type Claim = { tenantId: string; tabId: string; ts: number };

const h = vi.hoisted(() => ({
  status: { data: undefined as unknown, isLoading: true, isSuccess: false },
  stopMutate: vi.fn(),
  startMutate: vi.fn(),
  projects: { data: undefined as unknown },
  claimTenant: vi.fn(),
  currentOwner: null as { tenantId: string; tabId: string; ts: number } | null,
  onClaim: undefined as
    | ((claim: { tenantId: string; tabId: string; ts: number }) => void)
    | undefined,
}));

// Driving the subscription callback directly keeps these tests about the guard's use of tenant
// ownership rather than about BroadcastChannel's semantics under jsdom.
vi.mock("@/lib/tenant-ownership", () => ({
  claimTenant: h.claimTenant,
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
import { useImpersonateStore, useProjectStore } from "@/store";

beforeEach(() => {
  useImpersonateStore.getState().reset();
  useProjectStore.getState().resetProjectStore();
  h.status = { data: undefined, isLoading: true, isSuccess: false };
  h.stopMutate.mockReset().mockResolvedValue(undefined);
  h.startMutate.mockReset().mockResolvedValue(undefined);
  h.projects = { data: undefined };
  h.claimTenant.mockReset();
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
  const P1 = { itemId: "p1", tenantId: "t1", tenantGroupId: "tg1" };

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
      await screen.findByText("Could not open this project"),
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
      await screen.findByText("This project is open in another tab"),
    ).toBeInTheDocument();
    expect(screen.queryByText("child")).toBeNull();
  });

  it("claims the cookie for other tabs after a successful retarget", async () => {
    useProjectStore.getState().setProjects([P1] as never);
    useImpersonateStore.getState().setImpersonation(true, "orig", "t2");

    renderAt("p1");

    await waitFor(() => expect(h.claimTenant).toHaveBeenCalledWith("t1"));
  });
});
