import { createContext } from "react";

export type SidebarContextValue = {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  closeWithoutPersist: () => void;
  isSidebarSubMenuOpen: boolean;
  toggleSidebarSubMenu: () => void;
  showSidebarSubMenu: () => void;
  subMenuId: string | null;
  updateSubMenuId: (id: string) => void;
  servicesSearchTerm: string;
  updateServicesSearchTerm: (term: string) => void;
};

export const defaultContextValue: SidebarContextValue = {
  isSidebarOpen: false,
  toggleSidebar: () => undefined,
  closeSidebar: () => undefined,
  closeWithoutPersist: () => undefined,
  isSidebarSubMenuOpen: false,
  toggleSidebarSubMenu: () => undefined,
  showSidebarSubMenu: () => undefined,
  subMenuId: null,
  updateSubMenuId: () => undefined,
  servicesSearchTerm: "",
  updateServicesSearchTerm: () => undefined,
};

export const SidebarContext =
  createContext<SidebarContextValue>(defaultContextValue);
