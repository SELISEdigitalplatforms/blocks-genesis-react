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

const wrapper = () => {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
};

beforeEach(() => {
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

  it("useGetProject fetches a single project when an id is present", async () => {
    const { result } = renderHook(() => useGetProject({ projectId: "p1" }), {
      wrapper: wrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(h.getProject).toHaveBeenCalled();
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
    hook: () => { mutate: (p?: unknown) => void; isSuccess: boolean },
    payload?: unknown,
  ) => {
    const { result } = renderHook(hook, { wrapper: wrapper() });
    await act(async () => {
      result.current.mutate(payload);
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
    await runMutation(() => useValidateCNameProject({ projectKey: "k" } as never));
    expect(h.validateCNameProject).toHaveBeenCalled();
  });

  it("useDisableProject triggers disableProject", async () => {
    await runMutation(() => useDisableProject({ projectKey: "k" }));
    expect(h.disableProject).toHaveBeenCalled();
  });
});
