import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { IProject } from "@/models";

export interface ProjectStoreState {
  projects: IProject[];
  selectedProject: IProject | null;
  selectedTenantGroup: string | null;
  setSelectedProject: (project: IProject) => void;
  resetSelectedProject: () => void;
  setProjects: (projects: IProject[]) => void;
  resetProject: () => void;
  resetProjectStore: () => void;
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
        set((state) => ({
          ...state,
          selectedTenantGroup: project.tenantGroupId ?? null,
        }));
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
      resetProjectStore() {
        set(() => ({
          projects: [],
          selectedProject: null,
          selectedTenantGroup: null,
        }));
      },
      setTenantGroup(tenantGroupId) {
        set((state) => ({ ...state, selectedTenantGroup: tenantGroupId }));
      },
      resetTenantGroup() {
        set((state) => ({ ...state, selectedTenantGroup: null }));
      },
    }),
    {
      name: "project-storage",
      // Only the project LIST is persisted, and deliberately so.
      //
      // `persist` writes to localStorage, which is shared by every tab on the origin. The list is
      // identical for all of them, so sharing it is free -- and its synchronous hydration is what
      // lets the impersonation guard resolve the route's `itemId` to a tenant on the very first
      // render, before any request goes out.
      //
      // `selectedProject` is the opposite: it is per-tab state. Persisting it meant a reload or a
      // newly opened tab hydrated whichever project *another* tab happened to select last, so the
      // heading could name one project while the session belonged to another. It is now derived
      // from the route, which is the only per-tab source of truth we have.
      partialize: (state) => ({ projects: state.projects }),
    },
  ),
);
