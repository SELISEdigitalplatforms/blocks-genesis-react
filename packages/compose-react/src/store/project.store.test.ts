import { describe, it, expect, beforeEach } from "vitest";
import { useProjectStore } from "@/store/project.store";

describe("useProjectStore", () => {
  beforeEach(() => useProjectStore.getState().resetProjectStore());

  it("starts empty", () => {
    const state = useProjectStore.getState();
    expect(state.projects).toEqual([]);
    expect(state.selectedProject).toBeNull();
    expect(state.selectedTenantGroup).toBeNull();
  });

  it("setSelectedProject sets the project and derives the tenant group", () => {
    useProjectStore
      .getState()
      .setSelectedProject({ tenantGroupId: "tg1" } as never);
    expect(useProjectStore.getState().selectedProject).toEqual({
      tenantGroupId: "tg1",
    });
    expect(useProjectStore.getState().selectedTenantGroup).toBe("tg1");
  });

  it("setSelectedProject falls back to a null tenant group when absent", () => {
    useProjectStore.getState().setSelectedProject({} as never);
    expect(useProjectStore.getState().selectedTenantGroup).toBeNull();
  });

  it("resetSelectedProject clears just the selection", () => {
    useProjectStore
      .getState()
      .setSelectedProject({ tenantGroupId: "tg1" } as never);
    useProjectStore.getState().resetSelectedProject();
    expect(useProjectStore.getState().selectedProject).toBeNull();
  });

  it("setProjects and resetProject manage the project list", () => {
    useProjectStore.getState().setProjects([{ id: 1 }] as never);
    expect(useProjectStore.getState().projects).toHaveLength(1);
    useProjectStore.getState().resetProject();
    expect(useProjectStore.getState().projects).toEqual([]);
  });

  it("setTenantGroup and resetTenantGroup manage the tenant group", () => {
    useProjectStore.getState().setTenantGroup("tg2");
    expect(useProjectStore.getState().selectedTenantGroup).toBe("tg2");
    useProjectStore.getState().resetTenantGroup();
    expect(useProjectStore.getState().selectedTenantGroup).toBeNull();
  });

  it("resetProjectStore clears every field", () => {
    useProjectStore.getState().setProjects([{ id: 1 }] as never);
    useProjectStore
      .getState()
      .setSelectedProject({ tenantGroupId: "tg1" } as never);
    useProjectStore.getState().resetProjectStore();
    const state = useProjectStore.getState();
    expect(state.projects).toEqual([]);
    expect(state.selectedProject).toBeNull();
    expect(state.selectedTenantGroup).toBeNull();
  });
});
