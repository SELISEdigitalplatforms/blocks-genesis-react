import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ReactNode } from "react";
import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const h = vi.hoisted(() => ({
  getProjects: vi.fn(),
  getProject: vi.fn(),
  getEnvRepositories: vi.fn(),
  repoUpdate: vi.fn(),
  updateTenantGroup: vi.fn(),
  updateProject: vi.fn(),
  validateCNameProject: vi.fn(),
  disableProject: vi.fn(),
}));
vi.mock("@/services/project.service", () => ({ projectService: h }));

import {
  useGetProjects,
  useGetProject,
  useGetEnvRepositories,
  useUpdateRepositories,
  useUpdateTenantGroup,
  useUpdateProject,
  useValidateCNameProject,
  useDisableProject,
} from "@/hooks/use-project";
import { useImpersonateStore, useProjectStore } from "@/store";

const wrapper = () => {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return Wrapper;
};

beforeEach(() => {
  useProjectStore.getState().resetProjectStore();
  useImpersonateStore.getState().reset();
  Object.values(h).forEach((fn) => fn.mockReset());
  h.getProjects.mockResolvedValue([{ projects: [{ id: 1 }, { id: 2 }] }]);
  h.getProject.mockResolvedValue({ id: "p1" });
  h.getEnvRepositories.mockResolvedValue([]);
  h.repoUpdate.mockResolvedValue({});
  h.updateTenantGroup.mockResolvedValue({});
  h.updateProject.mockResolvedValue({});
  h.validateCNameProject.mockResolvedValue({});
  h.disableProject.mockResolvedValue({});
});

describe("use-project queries", () => {
  it("useGetProjects fetches and flattens the result into the store", async () => {
    const { result } = renderHook(
      () => useGetProjects({ tenantGroupId: "tg1", enabled: true }),
      { wrapper: wrapper() },
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(h.getProjects).toHaveBeenCalledWith(0, 100, "tg1");
  });

  it("useGetProject fetches once impersonation is active and a project is selected", async () => {
    useProjectStore.getState().setSelectedProject({ itemId: "p1" } as never);
    useImpersonateStore.getState().impersonate("tenant-a", "root-tenant");

    const { result } = renderHook(() => useGetProject(), {
      wrapper: wrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(h.getProject).toHaveBeenCalled();
  });

  // Project/Get resolves the project from the caller's token, not from an
  // argument. On console and project-overview routes ImpersonationTerminator has
  // dropped the token to the root tenant, so a request there would describe the
  // platform's own project — and no consumer on those routes reads it.
  it("useGetProject stays idle when the token is not impersonated", async () => {
    useProjectStore.getState().setSelectedProject({ itemId: "p1" } as never);

    const { result } = renderHook(() => useGetProject(), {
      wrapper: wrapper(),
    });
    await waitFor(() => expect(result.current.fetchStatus).toBe("idle"));
    expect(h.getProject).not.toHaveBeenCalled();
  });

  it("useGetProject stays idle when impersonated with no project selected", async () => {
    useImpersonateStore.getState().impersonate("tenant-a", "root-tenant");

    const { result } = renderHook(() => useGetProject(), {
      wrapper: wrapper(),
    });
    await waitFor(() => expect(result.current.fetchStatus).toBe("idle"));
    expect(h.getProject).not.toHaveBeenCalled();
  });

  it("useGetEnvRepositories fetches when a project key is present", async () => {
    const { result } = renderHook(() => useGetEnvRepositories("key"), {
      wrapper: wrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(h.getEnvRepositories).toHaveBeenCalled();
  });
});

describe("use-project mutations", () => {
  const runMutation = async (
    hook: () => { mutate: (p: never) => void; isSuccess: boolean },
    payload?: unknown,
  ) => {
    const { result } = renderHook(hook, { wrapper: wrapper() });
    await act(async () => {
      result.current.mutate(payload as never);
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  };

  it("useUpdateRepositories triggers repoUpdate", async () => {
    await runMutation(() => useUpdateRepositories(), { a: 1 });
    expect(h.repoUpdate).toHaveBeenCalled();
  });

  it("useUpdateTenantGroup triggers updateTenantGroup", async () => {
    await runMutation(() => useUpdateTenantGroup(), { id: "t" });
    expect(h.updateTenantGroup).toHaveBeenCalled();
  });

  it("useUpdateProject triggers updateProject", async () => {
    await runMutation(() => useUpdateProject(), { id: "p" });
    expect(h.updateProject).toHaveBeenCalled();
  });

  it("useValidateCNameProject triggers validateCNameProject", async () => {
    await runMutation(() =>
      useValidateCNameProject({ projectKey: "k" } as never),
    );
    expect(h.validateCNameProject).toHaveBeenCalled();
  });

  it("useDisableProject triggers disableProject", async () => {
    await runMutation(() => useDisableProject({ projectKey: "k" }));
    expect(h.disableProject).toHaveBeenCalled();
  });
});
