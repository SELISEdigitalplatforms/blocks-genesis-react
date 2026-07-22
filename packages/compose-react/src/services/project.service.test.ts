import { describe, it, expect, vi, beforeEach } from "vitest";

const h = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn() }));
vi.mock("@/lib/http/instances", () => ({
  logicClient: { get: h.get, post: h.post },
}));
vi.mock("@/lib", () => ({
  getRuntimeEnv: () => "https://test.local",
  HttpClient: class {
    get = h.get;
    post = h.post;
  },
}));

import { projectService } from "@/services/project.service";
import { PROJECT_ENDPOINTS } from "@/constants/endpoint.constant";

beforeEach(() => {
  h.get.mockReset().mockResolvedValue("ok");
  h.post.mockReset().mockResolvedValue("ok");
});

describe("ProjectService", () => {
  it("getProjects builds a paged, tenant-scoped URL", async () => {
    await projectService.getProjects(1, 50, "tg1");
    expect(h.get).toHaveBeenCalledWith(
      `${PROJECT_ENDPOINTS.GETS}?page=1&pageSize=50&tenantGroupId=tg1`,
    );
  });

  it("getProject targets a single project id", async () => {
    await projectService.getProject({ projectId: "p1" } as never);
    expect(h.get).toHaveBeenCalledWith(`${PROJECT_ENDPOINTS.GET}?projectId=p1`);
  });

  it("getEnvRepositories hits the repos list endpoint", async () => {
    await projectService.getEnvRepositories();
    expect(h.get).toHaveBeenCalledWith(PROJECT_ENDPOINTS.REPOS_LIST);
  });

  it("repoUpdate posts the repo domains", async () => {
    const payload = { projectKey: "k", projectEnv: "e", repoWithDomains: [] };
    await projectService.repoUpdate(payload as never);
    expect(h.post).toHaveBeenCalledWith(PROJECT_ENDPOINTS.REPO_UPDATE, payload);
  });

  it("posts updates, disable and cname validation to their endpoints", async () => {
    await projectService.updateTenantGroup({ a: 1 } as never);
    expect(h.post).toHaveBeenCalledWith(PROJECT_ENDPOINTS.UPDATE_TENANT_GROUP, {
      a: 1,
    });
    await projectService.updateProject({ b: 2 } as never);
    expect(h.post).toHaveBeenCalledWith(PROJECT_ENDPOINTS.UPDATE_PROJECT, {
      b: 2,
    });
    await projectService.disableProject({ c: 3 } as never);
    expect(h.post).toHaveBeenCalledWith(PROJECT_ENDPOINTS.DISABLE, { c: 3 });
    await projectService.validateCNameProject({ d: 4 } as never);
    expect(h.post).toHaveBeenCalledWith(PROJECT_ENDPOINTS.CONFIGURE, { d: 4 });
  });
});
