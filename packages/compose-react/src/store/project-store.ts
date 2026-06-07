import type { IProject } from "@/services/project.service";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ProjectStoreState {
  projects: IProject[];
  selectedProject: IProject | null;
  selectedTenantGroup: string | null;
  setSelectedProject: (project: IProject) => void;
  resetSelectedProject: () => void;
  setProjects: (projects: IProject[]) => void;
  resetProject: () => void;
  reset: () => void;
  setTenantGroup: (tenantGroupId: string) => void;
  resetTenantGroup: () => void;
}

export const useProjectStore = create<ProjectStoreState>()(
  persist(
    (set) => ({
      projects: [],
      selectedProject: null,
      selectedTenantGroup: null,
      setSelectedProject(project) {
        set((state) => ({ ...state, selectedProject: project }));
        set((state) => ({ ...state, selectedTenantGroup: project.tenantGroupId ?? null }));
      },
      resetSelectedProject() {
        set((state) => ({ ...state, selectedProject: null }));
      },
      setProjects(projects) {
        set((state) => ({ ...state, projects }));
      },
      resetProject() {
        set((state) => ({ ...state, projects: [] }));
      },
      reset() {
        set(() => ({ projects: [], selectedProject: null, selectedTenantGroup: null }));
      },
      setTenantGroup(tenantGroupId) {
        set((state) => ({ ...state, selectedTenantGroup: tenantGroupId }));
      },
      resetTenantGroup() {
        set((state) => ({ ...state, selectedTenantGroup: null }));
      },
    }),
    { name: "project-store" },
  ),
);
