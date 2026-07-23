import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

const h = vi.hoisted(() => ({
  status: { data: undefined as unknown, isLoading: true, isSuccess: false },
  stopMutate: vi.fn(),
  startMutate: vi.fn(),
  projects: { data: undefined as unknown },
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
